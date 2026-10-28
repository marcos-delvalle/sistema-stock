import { Router } from 'express'
import { consultar } from '../db/pool.js'
import { asyncHandler, ErrorHttp } from '../lib/http.js'
import { traducirErrorDb } from '../lib/dbErrores.js'
import { idDesdeParams, textoObligatorio } from '../lib/validar.js'

export const rutasCategorias = Router()

rutasCategorias.get('/', asyncHandler(async (_req, res) => {
  const { rows } = await consultar(
    'SELECT id, nombre FROM categorias ORDER BY nombre'
  )

  res.json(rows)
}))

rutasCategorias.post('/', asyncHandler(async (req, res) => {
  const nombre = textoObligatorio(req.body?.nombre, 'nombre', 80)

  try {
    const { rows } = await consultar(
      'INSERT INTO categorias (nombre) VALUES ($1) RETURNING id, nombre',
      [nombre]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasCategorias.put('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const nombre = textoObligatorio(req.body?.nombre, 'nombre', 80)

  try {
    const { rows } = await consultar(
      'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING id, nombre',
      [nombre, id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Categoría no encontrada')
    }

    res.json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasCategorias.delete('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)

  try {
    const { rowCount } = await consultar(
      'DELETE FROM categorias WHERE id = $1',
      [id]
    )

    if (rowCount === 0) {
      throw new ErrorHttp(404, 'Categoría no encontrada')
    }

    res.status(204).end()
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))
