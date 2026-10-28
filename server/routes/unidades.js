import { Router } from 'express'
import { consultar } from '../db/pool.js'
import { asyncHandler, ErrorHttp } from '../lib/http.js'
import { traducirErrorDb } from '../lib/dbErrores.js'
import {
  enteroOpcional,
  enteroPositivo,
  idDesdeParams,
  textoObligatorio,
} from '../lib/validar.js'

export const rutasUnidades = Router()

const COLUMNAS = 'id, modelo_id, nombre, oficina_id, ip, estado'
const ESTADOS = ['activa', 'inactiva']

function validarEstado(valor) {
  const estado = valor ?? 'activa'

  if (!ESTADOS.includes(estado)) {
    throw new ErrorHttp(400, 'El estado debe ser "activa" o "inactiva"')
  }

  return estado
}

function normalizarIp(valor) {
  if (valor === undefined || valor === null || valor === '') return null
  return textoObligatorio(valor, 'ip', 45)
}

async function validarModelo(modeloId) {
  const { rowCount } = await consultar(
    'SELECT 1 FROM modelos WHERE id = $1',
    [modeloId]
  )

  if (rowCount === 0) {
    throw new ErrorHttp(400, 'El modelo de impresora no existe')
  }
}

async function validarOficina(oficinaId) {
  const { rowCount } = await consultar(
    'SELECT 1 FROM oficinas WHERE id = $1 AND activo = true',
    [oficinaId]
  )

  if (rowCount === 0) {
    throw new ErrorHttp(400, 'La oficina no existe o está inactiva')
  }
}

rutasUnidades.get('/', asyncHandler(async (req, res) => {
  const oficinaId = enteroOpcional(req.query.oficina_id, 'oficina_id')
  const modeloId = enteroOpcional(req.query.modelo_id, 'modelo_id')

  const { rows } = await consultar(
    `SELECT ${COLUMNAS}
     FROM unidades
     WHERE ($1::int IS NULL OR oficina_id = $1)
       AND ($2::int IS NULL OR modelo_id = $2)
     ORDER BY nombre`,
    [oficinaId, modeloId]
  )

  res.json(rows)
}))

rutasUnidades.post('/', asyncHandler(async (req, res) => {
  const modeloId = enteroPositivo(req.body?.modelo_id, 'modelo_id')
  const nombre = textoObligatorio(req.body?.nombre, 'nombre', 120)
  const oficinaId = enteroPositivo(req.body?.oficina_id, 'oficina_id')
  const ip = normalizarIp(req.body?.ip)
  const estado = validarEstado(req.body?.estado)

  try {
    await validarModelo(modeloId)
    await validarOficina(oficinaId)

    const { rows } = await consultar(
      `INSERT INTO unidades (modelo_id, nombre, oficina_id, ip, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNAS}`,
      [modeloId, nombre, oficinaId, ip, estado]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasUnidades.put('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)
  const modeloId = enteroPositivo(req.body?.modelo_id, 'modelo_id')
  const nombre = textoObligatorio(req.body?.nombre, 'nombre', 120)
  const oficinaId = enteroPositivo(req.body?.oficina_id, 'oficina_id')
  const ip = normalizarIp(req.body?.ip)
  const estado = validarEstado(req.body?.estado)

  try {
    await validarModelo(modeloId)
    await validarOficina(oficinaId)

    const { rows } = await consultar(
      `UPDATE unidades
       SET modelo_id = $1,
           nombre = $2,
           oficina_id = $3,
           ip = $4,
           estado = $5,
           actualizado_en = now()
       WHERE id = $6
       RETURNING ${COLUMNAS}`,
      [modeloId, nombre, oficinaId, ip, estado, id]
    )

    if (!rows[0]) {
      throw new ErrorHttp(404, 'Unidad no encontrada')
    }

    res.json(rows[0])
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))

rutasUnidades.delete('/:id', asyncHandler(async (req, res) => {
  const id = idDesdeParams(req.params.id)

  try {
    const { rowCount } = await consultar(
      'DELETE FROM unidades WHERE id = $1',
      [id]
    )

    if (rowCount === 0) {
      throw new ErrorHttp(404, 'Unidad no encontrada')
    }

    res.status(204).end()
  } catch (error) {
    throw traducirErrorDb(error)
  }
}))
