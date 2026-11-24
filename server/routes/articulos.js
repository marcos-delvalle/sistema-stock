import { Router } from 'express'
import { consultar } from '../db/pool.js'
import { asyncHandler, ErrorHttp } from '../lib/http.js'
import { traducirErrorDb } from '../lib/dbErrores.js'
import { enTransaccion } from '../lib/transaccion.js'
import {
  booleanoOpcional,
  enteroNoNegativo,
  enteroOpcional,
  enteroPositivo,
  idDesdeParams,
  textoObligatorio,
} from '../lib/validar.js'

export const rutasArticulos = Router()

const COLUMNAS = 'id, nombre, categoria_id, stock_actual, stock_minimo, activo'

rutasArticulos.get('/', asyncHandler(async (req, res) => {
  const categoriaId = enteroOpcional(req.query.categoria_id, 'categoria_id')
  const activo = booleanoOpcional(req.query.activo, 'activo')

  const { rows } = await consultar(
    `SELECT ${COLUMNAS}
     FROM articulos
     WHERE ($1::int IS NULL OR categoria_id = $1)
       AND ($2::boolean IS NULL OR activo = $2)
     ORDER BY nombre`,
    [categoriaId, activo]
  )

  res.json(rows)
}))

/**
 * Alta de artículo.
 * Si stock_actual > 0, se registra automáticamente una entrada al depósito
 * para que el historial sea coherente con el stock.
 */
rutasArticulos.post('/', asyncHandler(async (req, res) => {
  const nombre = textoObligatorio(req.body?.nombre, 'nombre')
  const categoriaId = enteroPositivo(req.body?.categoria_id, 'categoria_id')
  const stockInicial = req.body?.stock_actual === undefined
    ? 0
    : enteroNoNegativo(req.body.stock_actual, 'stock_actual')
  const stockMinimo = req.body?.stock_minimo === undefined
    ? 0
    : enteroNoNegativo(req.body.stock_minimo, 'stock_minimo')

  try {
    const articulo = await enTransaccion(async (cliente) => {
      const categoria = await cliente.query(
        'SELECT 1 FROM categorias WHERE id = $1',
        [categoriaId]
      )

      if (categoria.rowCount === 0) {
        throw new ErrorHttp(400, 'La categoría no existe')
      }

      const { rows } = await cliente.query(
        `INSERT INTO articulos (nombre, categoria_id, stock_actual, stock_minimo)
         VALUES ($1, $2, $3, $4)
         RETURNING ${COLUMNAS}`,
        [nombre, categoriaId, stockInicial, stockMinimo]
      )

      const creado = rows[0]

      if (stockInicial > 0) {
        await cliente.query(
          `INSERT INTO movimientos (articulo_id, tipo, cantidad, oficina_id, fecha)
           VALUES ($1, 'entrada', $2, NULL, CURRENT_DATE)`,
          [creado.id, stockInicial]
        )
      }

      return creado
    })

    res.status(201).json(articulo)
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

/**
 * Edición de datos del artículo.
 * El stock NO se edita directamente: cambia solo con entradas y salidas.
 */
rutasArticulos.put('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const nombre = textoObligatorio(req.body?.nombre, 'nombre')
  const categoriaId = enteroPositivo(req.body?.categoria_id, 'categoria_id')
  const stockMinimo = enteroNoNegativo(req.body?.stock_minimo, 'stock_minimo')

  try {
    const categoria = await consultar(
      'SELECT 1 FROM categorias WHERE id = $1',
      [categoriaId]
    )

    if (categoria.rowCount === 0) {
      throw new ErrorHttp(400, 'La categoría no existe')
    }

    const { rows } = await consultar(
      `UPDATE articulos
       SET nombre = $1,
           categoria_id = $2,
           stock_minimo = $3,
           actualizado_en = now()
       WHERE id = $4
       RETURNING ${COLUMNAS}`,
      [nombre, categoriaId, stockMinimo, id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Artículo no encontrado')
    }

    res.json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

/**
 * Ajuste manual de stock.
 * No es una entrada ni una salida: actualiza stock_actual y deja un registro
 * de tipo 'ajuste' en el historial con el stock anterior, el nuevo y el motivo.
 * El stock siempre queda respaldado por un movimiento auditable.
 */
rutasArticulos.patch('/:id/stock', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)

  if (
    req.body?.stock_nuevo === undefined
    || req.body?.stock_nuevo === null
    || req.body?.stock_nuevo === ''
  ) {
    throw new ErrorHttp(400, 'El campo "stock_nuevo" es obligatorio')
  }

  const stockNuevo = enteroNoNegativo(req.body.stock_nuevo, 'stock_nuevo')
  const motivo = textoObligatorio(req.body?.motivo, 'motivo', 200)

  try {
    const articulo = await enTransaccion(async (cliente) => {
      const { rows } = await cliente.query(
        `SELECT id, nombre, stock_actual
         FROM articulos
         WHERE id = $1
         FOR UPDATE`,
        [id]
      )

      const actual = rows[0]

      if (!actual) {
        throw new ErrorHttp(404, 'Artículo no encontrado')
      }

      if (actual.stock_actual === stockNuevo) {
        throw new ErrorHttp(400, 'El stock nuevo debe ser distinto del stock actual')
      }

      await cliente.query(
        `UPDATE articulos
         SET stock_actual = $1, actualizado_en = now()
         WHERE id = $2`,
        [stockNuevo, id]
      )

      await cliente.query(
        `INSERT INTO movimientos (
           articulo_id, tipo, cantidad, oficina_id, fecha, afecta_stock,
           stock_anterior, stock_nuevo, motivo
         )
         VALUES ($1, 'ajuste', $2, NULL, CURRENT_DATE, true, $3, $4, $5)`,
        [
          id,
          Math.abs(stockNuevo - actual.stock_actual),
          actual.stock_actual,
          stockNuevo,
          motivo,
        ]
      )

      return { ...actual, stock_actual: stockNuevo }
    })

    res.json(articulo)
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasArticulos.patch('/:id/activo', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const activo = req.body?.activo

  if (typeof activo !== 'boolean') {
    throw new ErrorHttp(400, 'El campo "activo" debe ser booleano')
  }

  const { rows } = await consultar(
    `UPDATE articulos
     SET activo = $1, actualizado_en = now()
     WHERE id = $2
     RETURNING ${COLUMNAS}`,
    [activo, id]
  )

  if (!rows[0]) {
    throw new ErrorHttp(404, 'Artículo no encontrado')
  }

  res.json(rows[0])
}))

/**
 * Baja definitiva de un artículo inactivo.
 * Borra el artículo y todo su historial de movimientos en una sola transacción.
 * Está pensada para limpiar artículos cargados por error: es irreversible.
 * Los modelos que lo usaban como tóner quedan sin asignar por la FK
 * ON DELETE SET NULL de modelos.articulo_id.
 */
rutasArticulos.delete('/:id/definitivo', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)

  try {
    await enTransaccion(async (cliente) => {
      const { rows } = await cliente.query(
        `SELECT id, nombre, activo
         FROM articulos
         WHERE id = $1
         FOR UPDATE`,
        [id]
      )

      const articulo = rows[0]

      if (!articulo) {
        throw new ErrorHttp(404, 'Artículo no encontrado')
      }

      if (articulo.activo) {
        throw new ErrorHttp(
          409,
          'Primero dá de baja el artículo antes de eliminarlo definitivamente'
        )
      }

      await cliente.query(
        'DELETE FROM movimientos WHERE articulo_id = $1',
        [id]
      )

      await cliente.query(
        'DELETE FROM articulos WHERE id = $1',
        [id]
      )
    })

    res.status(204).end()
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

/**
 * Baja lógica. Además desasigna los modelos de impresora que usaban
 * este artículo como tóner compatible.
 */
rutasArticulos.delete('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)

  try {
    await enTransaccion(async (cliente) => {
      const { rows } = await cliente.query(
        `UPDATE articulos
         SET activo = false, actualizado_en = now()
         WHERE id = $1 AND activo = true
         RETURNING id`,
        [id]
      )

      if (!rows[0]) {
        throw new ErrorHttp(404, 'Artículo no encontrado o ya inactivo')
      }

      await cliente.query(
        `UPDATE modelos
         SET articulo_id = NULL, actualizado_en = now()
         WHERE articulo_id = $1`,
        [id]
      )
    })

    res.status(204).end()
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))
