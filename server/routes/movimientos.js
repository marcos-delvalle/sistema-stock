import { Router } from 'express'
import { consultar } from '../db/pool.js'
import { asyncHandler, ErrorHttp } from '../lib/http.js'
import { traducirErrorDb } from '../lib/dbErrores.js'
import { enTransaccion } from '../lib/transaccion.js'
import {
  booleano,
  enteroOpcional,
  enteroPositivo,
  fechaOpcional,
  idDesdeParams,
} from '../lib/validar.js'

export const rutasMovimientos = Router()

function leerMovimiento(body) {
  const articuloId = enteroPositivo(body?.articulo_id, 'articulo_id')
  const cantidad = enteroPositivo(body?.cantidad, 'cantidad')
  const tipo = body?.tipo
  const oficinaId = body?.oficina_id == null
    ? null
    : enteroPositivo(body.oficina_id, 'oficina_id')
  const fecha = body?.fecha
    ? fechaOpcional(body.fecha, 'fecha')
    : null
  const afectaStock = booleano(body?.afecta_stock, 'afecta_stock', true)

  if (tipo !== 'entrada' && tipo !== 'salida') {
    throw new ErrorHttp(400, 'El campo "tipo" debe ser "entrada" o "salida"')
  }

  if (tipo === 'entrada' && oficinaId !== null) {
    throw new ErrorHttp(400, 'Una entrada va al depósito y no lleva oficina')
  }

  if (tipo === 'salida' && oficinaId === null) {
    throw new ErrorHttp(400, 'Una salida debe indicar la oficina de destino')
  }

  return { articuloId, cantidad, tipo, oficinaId, fecha, afectaStock }
}

async function consultarDetalle(cliente, id) {
  const { rows } = await cliente.query(
    `SELECT m.id, m.articulo_id, a.nombre AS articulo_nombre,
            m.tipo, m.cantidad, m.oficina_id, o.nombre AS oficina_nombre, m.fecha,
            m.afecta_stock
     FROM movimientos m
     JOIN articulos a ON a.id = m.articulo_id
     LEFT JOIN oficinas o ON o.id = m.oficina_id
     WHERE m.id = $1`,
    [id]
  )

  return rows[0]
}

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
            m.tipo, m.cantidad, m.oficina_id, o.nombre AS oficina_nombre, m.fecha,
            m.afecta_stock
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
 *   2. Se valida que alcance (salidas, solo si afecta_stock).
 *   3. Se inserta el movimiento.
 *   4. Se actualiza el stock (solo si afecta_stock).
 * Si afecta_stock es false, el movimiento queda registrado sin validar ni
 * modificar el stock: sirve para cargar movimientos históricos.
 * Si cualquier paso falla, ROLLBACK: no queda stock descontado sin movimiento.
 */
rutasMovimientos.post('/', asyncHandler(async (req, res) => {
  const { articuloId, cantidad, tipo, oficinaId, fecha, afectaStock } = leerMovimiento(req.body)

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

        if (afectaStock && articulo.stock_actual < cantidad) {
          throw new ErrorHttp(
            409,
            `Stock insuficiente: hay ${articulo.stock_actual} y se intentan sacar ${cantidad}`
          )
        }
      }

      if (afectaStock) {
        const nuevoStock = tipo === 'entrada'
          ? articulo.stock_actual + cantidad
          : articulo.stock_actual - cantidad

        await cliente.query(
          `UPDATE articulos
           SET stock_actual = $1, actualizado_en = now()
           WHERE id = $2`,
          [nuevoStock, articuloId]
        )
      }

      const { rows } = await cliente.query(
        `INSERT INTO movimientos (articulo_id, tipo, cantidad, oficina_id, fecha, afecta_stock)
         VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE), $6)
         RETURNING id`,
        [articuloId, tipo, cantidad, oficinaId, fecha, afectaStock]
      )

      return consultarDetalle(cliente, rows[0].id)
    })

    res.status(201).json(movimiento)
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

/**
 * Edición de movimiento.
 * El stock actual ya incluye el efecto del movimiento anterior. Por eso:
 *   1. Se bloquean el movimiento y los artículos involucrados.
 *   2. Se revierte el efecto anterior (si afectaba stock).
 *   3. Se aplica el efecto nuevo (si afecta stock).
 *   4. Se valida que ningún artículo quede con stock negativo.
 *   5. Se actualiza el movimiento y el stock en la misma transacción.
 */
rutasMovimientos.put('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const nuevo = leerMovimiento(req.body)

  try {
    const movimiento = await enTransaccion(async (cliente) => {
      const { rows: filasMovimiento } = await cliente.query(
        `SELECT id, articulo_id, tipo, cantidad, oficina_id, fecha, afecta_stock
         FROM movimientos
         WHERE id = $1
         FOR UPDATE`,
        [id]
      )

      const actual = filasMovimiento[0]

      if (!actual) {
        throw new ErrorHttp(404, 'Movimiento no encontrado')
      }

      const idsArticulos = [...new Set([actual.articulo_id, nuevo.articuloId])]
        .sort((a, b) => a - b)

      const { rows: filasArticulos } = await cliente.query(
        `SELECT id, nombre, stock_actual, activo
         FROM articulos
         WHERE id = ANY($1::int[])
         ORDER BY id
         FOR UPDATE`,
        [idsArticulos]
      )

      if (filasArticulos.length !== idsArticulos.length) {
        throw new ErrorHttp(400, 'El artículo no existe')
      }

      const articulosPorId = new Map(filasArticulos.map((a) => [a.id, a]))
      const articuloNuevo = articulosPorId.get(nuevo.articuloId)

      // Se permite editar un movimiento histórico de un artículo dado de baja,
      // pero no mover el movimiento a otro artículo inactivo.
      if (nuevo.articuloId !== actual.articulo_id && !articuloNuevo.activo) {
        throw new ErrorHttp(409, 'El artículo está inactivo')
      }

      if (nuevo.tipo === 'salida') {
        const { rows: filasOficina } = await cliente.query(
          'SELECT id, activo FROM oficinas WHERE id = $1',
          [nuevo.oficinaId]
        )

        const oficina = filasOficina[0]

        if (!oficina) {
          throw new ErrorHttp(400, 'La oficina no existe')
        }

        // Igual que con el artículo: se conserva una oficina histórica,
        // pero no se permite cambiar a otra que esté inactiva.
        if (nuevo.oficinaId !== actual.oficina_id && !oficina.activo) {
          throw new ErrorHttp(400, 'La oficina no existe o está inactiva')
        }
      }

      const stock = new Map(filasArticulos.map((a) => [a.id, a.stock_actual]))

      if (actual.afecta_stock) {
        const efectoAnterior = actual.tipo === 'entrada'
          ? -actual.cantidad
          : actual.cantidad

        stock.set(actual.articulo_id, stock.get(actual.articulo_id) + efectoAnterior)
      }

      if (nuevo.afectaStock) {
        const efectoNuevo = nuevo.tipo === 'entrada'
          ? nuevo.cantidad
          : -nuevo.cantidad

        stock.set(nuevo.articuloId, stock.get(nuevo.articuloId) + efectoNuevo)
      }

      for (const articuloId of idsArticulos) {
        const stockFinal = stock.get(articuloId)

        if (stockFinal < 0) {
          const articulo = articulosPorId.get(articuloId)

          throw new ErrorHttp(
            409,
            `Stock insuficiente: "${articulo.nombre}" quedaría con ${stockFinal} ` +
            `unidad${stockFinal === -1 ? '' : 'es'}.`
          )
        }
      }

      for (const articuloId of idsArticulos) {
        const stockFinal = stock.get(articuloId)

        if (stockFinal !== articulosPorId.get(articuloId).stock_actual) {
          await cliente.query(
            `UPDATE articulos
             SET stock_actual = $1, actualizado_en = now()
             WHERE id = $2`,
            [stockFinal, articuloId]
          )
        }
      }

      await cliente.query(
        `UPDATE movimientos
         SET articulo_id = $1, tipo = $2, cantidad = $3, oficina_id = $4,
             fecha = COALESCE($5::date, fecha), afecta_stock = $6
         WHERE id = $7`,
        [
          nuevo.articuloId,
          nuevo.tipo,
          nuevo.cantidad,
          nuevo.oficinaId,
          nuevo.fecha,
          nuevo.afectaStock,
          id,
        ]
      )

      return consultarDetalle(cliente, id)
    })

    res.json(movimiento)
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))
