import { Router } from 'express'
import { consultar } from '../db/pool.js'
import { asyncHandler, ErrorHttp } from '../lib/http.js'
import { traducirErrorDb } from '../lib/dbErrores.js'
import { booleanoOpcional, idDesdeParams, textoObligatorio } from '../lib/validar.js'

export const rutasDependencias = Router()

const COLUMNAS = 'id, nombre, activo'

rutasDependencias.get('/', asyncHandler(async (req, res) => {
  const activo = booleanoOpcional(req.query.activo, 'activo')

  const { rows } = await consultar(
    `SELECT ${COLUMNAS}
     FROM dependencias
     WHERE ($1::boolean IS NULL OR activo = $1)
     ORDER BY nombre`,
    [activo]
  )

  res.json(rows)
}))

// Si el nombre ya existe pero estaba dado de baja, se reactiva.
rutasDependencias.post('/', asyncHandler(async (req, res) => {
  const nombre = textoObligatorio(req.body?.nombre, 'nombre', 120)

  try {
    const { rows } = await consultar(
      `INSERT INTO dependencias (nombre)
       VALUES ($1)
       ON CONFLICT (nombre)
       DO UPDATE SET activo = true, actualizado_en = now()
       RETURNING ${COLUMNAS}`,
      [nombre]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasDependencias.put('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const nombre = textoObligatorio(req.body?.nombre, 'nombre', 120)

  try {
    const { rows } = await consultar(
      `UPDATE dependencias
       SET nombre = $1, actualizado_en = now()
       WHERE id = $2
       RETURNING ${COLUMNAS}`,
      [nombre, id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Dependencia no encontrada')
    }

    res.json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasDependencias.patch('/:id/activo', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const activo = req.body?.activo

  if (typeof activo !== 'boolean') {
    throw new ErrorHttp(400, 'El campo "activo" debe ser booleano')
  }

  if (!activo) {
    const { rows: oficinas } = await consultar(
      `SELECT count(*)::int AS total
       FROM oficinas
       WHERE dependencia_id = $1 AND activo = true`,
      [id]
    )

    if (oficinas[0].total > 0) {
      throw new ErrorHttp(409, 'No se puede desactivar una dependencia con oficinas activas')
    }
  }

  const { rows } = await consultar(
    `UPDATE dependencias
     SET activo = $1, actualizado_en = now()
     WHERE id = $2
     RETURNING ${COLUMNAS}`,
    [activo, id]
  )

  if (!rows[0]) {
    throw new ErrorHttp(404, 'Dependencia no encontrada')
  }

  res.json(rows[0])
}))

// Baja lógica: no se permite si todavía tiene oficinas activas.
rutasDependencias.delete('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)

  try {
    const { rows: oficinas } = await consultar(
      `SELECT count(*)::int AS total
       FROM oficinas
       WHERE dependencia_id = $1 AND activo = true`,
      [id]
    )

    if (oficinas[0].total > 0) {
      throw new ErrorHttp(409, 'No se puede dar de baja una dependencia con oficinas activas')
    }

    const { rows } = await consultar(
      `UPDATE dependencias
       SET activo = false, actualizado_en = now()
       WHERE id = $1 AND activo = true
       RETURNING id`,
      [id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Dependencia no encontrada o ya inactiva')
    }

    res.status(204).end()
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))
