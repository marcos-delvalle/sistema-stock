import { Router } from 'express'
import { consultar } from '../db/pool.js'
import { asyncHandler, ErrorHttp } from '../lib/http.js'
import { traducirErrorDb } from '../lib/dbErrores.js'
import {
  booleanoOpcional,
  enteroOpcional,
  enteroPositivo,
  idDesdeParams,
  textoObligatorio,
} from '../lib/validar.js'

export const rutasOficinas = Router()

const COLUMNAS = 'id, nombre, dependencia_id, activo'

async function validarDependencia(dependenciaId) {
  const { rowCount } = await consultar(
    'SELECT 1 FROM dependencias WHERE id = $1 AND activo = true',
    [dependenciaId]
  )

  if (rowCount === 0) {
    throw new ErrorHttp(400, 'La dependencia no existe o está inactiva')
  }
}

rutasOficinas.get('/', asyncHandler(async (req, res) => {
  const dependenciaId = enteroOpcional(req.query.dependencia_id, 'dependencia_id')
  const activo = booleanoOpcional(req.query.activo, 'activo')

  const { rows } = await consultar(
    `SELECT ${COLUMNAS}
     FROM oficinas
     WHERE ($1::int IS NULL OR dependencia_id = $1)
       AND ($2::boolean IS NULL OR activo = $2)
     ORDER BY nombre`,
    [dependenciaId, activo]
  )

  res.json(rows)
}))

// Si la oficina ya existía dada de baja, se reactiva.
rutasOficinas.post('/', asyncHandler(async (req, res) => {
  const nombre = textoObligatorio(req.body?.nombre, 'nombre', 120)
  const dependenciaId = enteroPositivo(req.body?.dependencia_id, 'dependencia_id')

  try {
    await validarDependencia(dependenciaId)

    const { rows } = await consultar(
      `INSERT INTO oficinas (nombre, dependencia_id)
       VALUES ($1, $2)
       ON CONFLICT (dependencia_id, nombre)
       DO UPDATE SET activo = true, actualizado_en = now()
       RETURNING ${COLUMNAS}`,
      [nombre, dependenciaId]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasOficinas.put('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const nombre = textoObligatorio(req.body?.nombre, 'nombre', 120)
  const dependenciaId = enteroPositivo(req.body?.dependencia_id, 'dependencia_id')

  try {
    await validarDependencia(dependenciaId)

    const { rows } = await consultar(
      `UPDATE oficinas
       SET nombre = $1, dependencia_id = $2, actualizado_en = now()
       WHERE id = $3
       RETURNING ${COLUMNAS}`,
      [nombre, dependenciaId, id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Oficina no encontrada')
    }

    res.json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasOficinas.patch('/:id/activo', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const activo = req.body?.activo

  if (typeof activo !== 'boolean') {
    throw new ErrorHttp(400, 'El campo "activo" debe ser booleano')
  }

  try {
    if (activo) {
      const { rows: oficina } = await consultar(
        'SELECT dependencia_id FROM oficinas WHERE id = $1',
        [id]
      )

      if (!oficina[0]) {
        throw new ErrorHttp(404, 'Oficina no encontrada')
      }

      await validarDependencia(oficina[0].dependencia_id)
    } else {
      const { rows: unidades } = await consultar(
        'SELECT count(*)::int AS total FROM unidades WHERE oficina_id = $1',
        [id]
      )

      if (unidades[0].total > 0) {
        throw new ErrorHttp(409, 'No se puede desactivar una oficina con impresoras asignadas')
      }
    }

    const { rows } = await consultar(
      `UPDATE oficinas
       SET activo = $1, actualizado_en = now()
       WHERE id = $2
       RETURNING ${COLUMNAS}`,
      [activo, id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Oficina no encontrada')
    }

    res.json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

// Baja lógica: no se permite si todavía tiene impresoras asignadas.
rutasOficinas.delete('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)

  try {
    const { rows: unidades } = await consultar(
      'SELECT count(*)::int AS total FROM unidades WHERE oficina_id = $1',
      [id]
    )

    if (unidades[0].total > 0) {
      throw new ErrorHttp(409, 'No se puede dar de baja una oficina con impresoras asignadas')
    }

    const { rows } = await consultar(
      `UPDATE oficinas
       SET activo = false, actualizado_en = now()
       WHERE id = $1 AND activo = true
       RETURNING id`,
      [id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Oficina no encontrada o ya inactiva')
    }

    res.status(204).end()
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

// Impresoras asignadas a una oficina, con los datos de su modelo.
rutasOficinas.get('/:id/unidades', asyncHandler(async (req, res) => {
  const oficinaId = idDesdeParams(req.params.id, 'oficina_id')

  const { rows } = await consultar(
    `SELECT u.id, u.nombre, u.ip, u.estado, u.modelo_id,
            m.marca, m.modelo, m.articulo_id
     FROM unidades u
     JOIN modelos m ON m.id = u.modelo_id
     WHERE u.oficina_id = $1
     ORDER BY u.nombre`,
    [oficinaId]
  )

  res.json(rows)
}))

// Historial de una oficina: solo salidas (entregas).
rutasOficinas.get('/:id/movimientos', asyncHandler(async (req, res) => {
  const oficinaId = idDesdeParams(req.params.id, 'oficina_id')

  const { rows } = await consultar(
    `SELECT m.id, m.articulo_id, a.nombre AS articulo_nombre,
            m.tipo, m.cantidad, m.oficina_id, m.fecha
     FROM movimientos m
     JOIN articulos a ON a.id = m.articulo_id
     WHERE m.oficina_id = $1 AND m.tipo = 'salida'
     ORDER BY m.fecha DESC, m.id DESC`,
    [oficinaId]
  )

  res.json(rows)
}))
