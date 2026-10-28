import crypto from 'node:crypto'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../lib/env.js'
import { asyncHandler, ErrorHttp } from '../lib/http.js'
import { NOMBRE_COOKIE, requiereAdmin } from '../middleware/auth.js'
import { textoObligatorio } from '../lib/validar.js'

export const rutasAuth = Router()

const DURACION_SESION_MS = 12 * 60 * 60 * 1000

function compararSeguro(valorA, valorB) {
  const bufferA = Buffer.from(String(valorA))
  const bufferB = Buffer.from(String(valorB))

  if (bufferA.length !== bufferB.length) return false

  return crypto.timingSafeEqual(bufferA, bufferB)
}

function credencialesValidas(usuario, password) {
  return (
    compararSeguro(usuario, env.adminUser) &&
    compararSeguro(password, env.adminPassword)
  )
}

rutasAuth.post('/login', asyncHandler(async (req, res) => {
  const usuario = textoObligatorio(req.body?.usuario, 'usuario', 80)
  const password = textoObligatorio(req.body?.password, 'password', 200)

  if (!env.jwtSecret) {
    throw new ErrorHttp(500, 'Falta configurar JWT_SECRET en server/.env')
  }

  if (!credencialesValidas(usuario, password)) {
    throw new ErrorHttp(401, 'Usuario o contraseña incorrectos')
  }

  const token = jwt.sign(
    { sub: usuario, rol: 'admin' },
    env.jwtSecret,
    { expiresIn: '12h' }
  )

  res.cookie(NOMBRE_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // la app se usa por HTTP en la red local
    maxAge: DURACION_SESION_MS,
    path: '/',
  })

  res.json({ usuario })
}))

rutasAuth.post('/logout', (req, res) => {
  res.clearCookie(NOMBRE_COOKIE, { path: '/' })
  res.status(204).end()
})

rutasAuth.get('/me', requiereAdmin, (req, res) => {
  res.json({ usuario: req.usuario })
})
