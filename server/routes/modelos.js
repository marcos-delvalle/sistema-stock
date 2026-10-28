import { Router } from 'express'
import { consultar } from '../db/pool.js'
import { asyncHandler, ErrorHttp } from '../lib/http.js'
import { traducirErrorDb } from '../lib/dbErrores.js'
import { enteroPositivo, idDesdeParams, textoObligatorio } from '../lib/validar.js'

export const rutasModelos = Router()

const COLUMNAS = 'id, marca, modelo, articulo_id'

async function validarArticulo(articuloId) {
  if (articuloId === null) return null

  const { rowCount } = await consultar(
    'SELECT 1 FROM articulos WHERE id = $1 AND activo = true',
    [articuloId]
  )

  if (rowCount === 0) {
    throw new ErrorHttp(400, 'El artículo compatible no existe o está inactivo')
  }

  return articuloId
}

rutasModelos.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await consultar(
    `SELECT ${COLUMNAS}
     FROM modelos
     ORDER BY marca, modelo`
  )

  res.json(rows)
}))

rutasModelos.post('/', asyncHandler(async (req, res) => {
  const marca = textoObligatorio(req.body?.marca, 'marca', 80)
  const modelo = textoObligatorio(req.body?.modelo, 'modelo', 80)
  const articuloId = req.body?.articulo_id == null
    ? null
    : enteroPositivo(req.body.articulo_id, 'articulo_id')

  try {
    await validarArticulo(articuloId)

    const { rows } = await consultar(
      `INSERT INTO modelos (marca, modelo, articulo_id)
       VALUES ($1, $2, $3)
       RETURNING ${COLUMNAS}`,
      [marca, modelo, articuloId]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasModelos.put('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const marca = textoObligatorio(req.body?.marca, 'marca', 80)
  const modelo = textoObligatorio(req.body?.modelo, 'modelo', 80)
  const articuloId = req.body?.articulo_id == null
    ? null
    : enteroPositivo(req.body.articulo_id, 'articulo_id')

  try {
    await validarArticulo(articuloId)

    const { rows } = await consultar(
      `UPDATE modelos
       SET marca = $1, modelo = $2, articulo_id = $3, actualizado_en = now()
       WHERE id = $4
       RETURNING ${COLUMNAS}`,
      [marca, modelo, articuloId, id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Modelo no encontrado')
    }

    res.json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

// Cambia solamente el tóner compatible de un modelo.
rutasModelos.put('/:id/compatibilidad', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const articuloId = req.body?.articulo_id == null
    ? null
    : enteroPositivo(req.body.articulo_id, 'articulo_id')

  try {
    await validarArticulo(articuloId)

    const { rows } = await consultar(
      `UPDATE modelos
       SET articulo_id = $1, actualizado_en = now()
       WHERE id = $2
       RETURNING ${COLUMNAS}`,
      [articuloId, id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Modelo no encontrado')
    }

    res.json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasModelos.delete('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)

  try {
    const { rowCount } = await consultar(
      'DELETE FROM modelos WHERE id = $1',
      [id]
    )

    if (rowCount === 0) {
      throw new ErrorHttp(404, 'Modelo no encontrado')
    }

    res.status(204).end()
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))
