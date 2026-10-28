import { Router } from 'express'
import { probarConexion } from '../db/pool.js'

export const rutasSalud = Router()

/**
 * GET /api/salud
 * Sirve para verificar que el servidor está vivo y si la base responde.
 */
rutasSalud.get('/', async (_req, res) => {
  const baseDeDatos = await probarConexion()

  res.status(baseDeDatos ? 200 : 503).json({
    ok: baseDeDatos,
    servicio: 'gestion-stock-api',
    baseDeDatos: baseDeDatos ? 'conectada' : 'sin conexión',
    fecha: new Date().toISOString(),
  })
})
