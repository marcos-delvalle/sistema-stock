import jwt from 'jsonwebtoken'
import { env } from '../lib/env.js'

export const NOMBRE_COOKIE = 'sesion'

/**
 * Middleware: exige una cookie de sesión válida.
 * Se aplica a todas las rutas /api salvo /api/salud y /api/auth.
 */
export function requiereAdmin(req, res, next) {
  const token = req.cookies?.[NOMBRE_COOKIE]

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.usuario = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' })
  }
}
