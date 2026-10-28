import { Router } from 'express'
import { consultar } from '../db/pool.js'
import { asyncHandler, ErrorHttp } from '../lib/http.js'
import { traducirErrorDb } from '../lib/dbErrores.js'
import { enTransaccion } from '../lib/transaccion.js'
import {
  enteroOpcional,
  enteroPositivo,
  fechaOpcional,
} from '../lib/validar.js'

export const rutasMovimientos = Router()

rutasMovimientos.get('/', asyncHandler(async (req, res) => {
  const oficinaId = enteroOpcional(req.query.oficina_id, 'oficina_id')
  const articuloId = enteroOpcional(req.query.articulo_id, 'articulo_id')
  const desde = fechaOpcional(req.query.desde, 'desde')
  const hasta = fechaOpcional(req.query.hasta, 'hasta')

  const tipo = req.query.tipo ?? null

  if (tipo !== null && tipo !== 'entrada' && tipo !== 'salida') {
    throw new ErrorHttp(400, 'El filtro "tipo" debe ser "entrada" o "salida"')
  }

  const { rows } = await consultar(
    `SELECT m.id, m.articulo_id, a.nombre AS articulo_nombre,
            m.tipo, m.cantidad, m.oficina_id, o.nombre AS oficina_nombre, m.fecha
     FROM movimientos m
     JOIN articulos a ON a.id = m.articulo_id
     LEFT JOIN oficinas o ON o.id = m.oficina_id
     WHERE ($1::int IS NULL OR m.oficina_id = $1)
       AND ($2::int IS NULL OR m.articulo_id = $2)
       AND ($3::text IS NULL OR m.tipo = $3)
       AND ($4::date IS NULL OR m.fecha >= $4)
       AND ($5::date IS NULL OR m.fecha <= $5)
     ORDER BY m.fecha DESC, m.id DESC`,
    [oficinaId, articuloId, tipo, desde, hasta]
  )

  res.json(rows)
}))

/**
 * Alta de movimiento.
 * Todo ocurre en una transacción y con la fila del artículo bloqueada:
 *   1. Se lee el stock actual con FOR UPDATE.
 *   2. Se valida que alcance (salidas).
 *   3. Se inserta el movimiento.
 *   4. Se actualiza el stock.
 * Si cualquier paso falla, ROLLBACK: no queda stock descontado sin movimiento.
 */
rutasMovimientos.post('/', asyncHandler(async (req, res) => {
  const articuloId = enteroPositivo(req.body?.articulo_id, 'articulo_id')
  const cantidad = enteroPositivo(req.body?.cantidad, 'cantidad')
  const tipo = req.body?.tipo
  const oficinaId = req.body?.oficina_id == null
    ? null
    : enteroPositivo(req.body.oficina_id, 'oficina_id')
  const fecha = req.body?.fecha
    ? fechaOpcional(req.body.fecha, 'fecha')
    : null

  if (tipo !== 'entrada' && tipo !== 'salida') {
    throw new ErrorHttp(400, 'El campo "tipo" debe ser "entrada" o "salida"')
  }

  if (tipo === 'entrada' && oficinaId !== null) {
    throw new ErrorHttp(400, 'Una entrada va al depósito y no lleva oficina')
  }

  if (tipo === 'salida' && oficinaId === null) {
    throw new ErrorHttp(400, 'Una salida debe indicar la oficina de destino')
  }

  try {
    const movimiento = await enTransaccion(async (cliente) => {
      const { rows: filasArticulo } = await cliente.query(
        `SELECT id, stock_actual, activo
         FROM articulos
         WHERE id = $1
         FOR UPDATE`,
        [articuloId]
      )

      const articulo = filasArticulo[0]

      if (!articulo) {
        throw new ErrorHttp(404, 'Artículo no encontrado')
      }

      if (!articulo.activo) {
        throw new ErrorHttp(409, 'El artículo está inactivo')
      }

      if (tipo === 'salida') {
        const { rowCount } = await cliente.query(
          'SELECT 1 FROM oficinas WHERE id = $1 AND activo = true',
          [oficinaId]
        )

        if (rowCount === 0) {
          throw new ErrorHttp(400, 'La oficina no existe o está inactiva')
        }

        if (articulo.stock_actual < cantidad) {
          throw new ErrorHttp(
            409,
            `Stock insuficiente: hay ${articulo.stock_actual} y se intentan sacar ${cantidad}`
          )
        }
      }

      const nuevoStock = tipo === 'entrada'
        ? articulo.stock_actual + cantidad
        : articulo.stock_actual - cantidad

      await cliente.query(
        `UPDATE articulos
         SET stock_actual = $1, actualizado_en = now()
         WHERE id = $2`,
        [nuevoStock, articuloId]
      )

      const { rows } = await cliente.query(
        `INSERT INTO movimientos (articulo_id, tipo, cantidad, oficina_id, fecha)
         VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE))
         RETURNING id`,
        [articuloId, tipo, cantidad, oficinaId, fecha]
      )

      const { rows: detalle } = await cliente.query(
        `SELECT m.id, m.articulo_id, a.nombre AS articulo_nombre,
                m.tipo, m.cantidad, m.oficina_id, o.nombre AS oficina_nombre, m.fecha
         FROM movimientos m
         JOIN articulos a ON a.id = m.articulo_id
         LEFT JOIN oficinas o ON o.id = m.oficina_id
         WHERE m.id = $1`,
        [rows[0].id]
      )

      return detalle[0]
    })

    res.status(201).json(movimiento)
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))
