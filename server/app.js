import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { env } from './lib/env.js'
import { requiereAdmin } from './middleware/auth.js'
import { rutasSalud } from './routes/salud.js'
import { rutasAuth } from './routes/auth.js'
import { rutasCategorias } from './routes/categorias.js'
import { rutasArticulos } from './routes/articulos.js'
import { rutasModelos } from './routes/modelos.js'
import { rutasUnidades } from './routes/unidades.js'
import { rutasDependencias } from './routes/dependencias.js'
import { rutasOficinas } from './routes/oficinas.js'
import { rutasMovimientos } from './routes/movimientos.js'
import { manejarErrores, noEncontrado } from './middleware/errores.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const carpetaDist = path.resolve(__dirname, '../dist')

export function crearApp() {
  const app = express()

  // No revelar que usamos Express en los headers.
  app.disable('x-powered-by')

  // Headers de seguridad + parseo de JSON y cookies.
  // La app se usa por HTTP dentro de la red local: desactivamos HSTS y la
  // directiva upgrade-insecure-requests para que el navegador no intente HTTPS.
  app.use(helmet({
    hsts: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'upgrade-insecure-requests': null,
      },
    },
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  // Log simple de cada petición: método, ruta, estado y duración.
  app.use((req, res, next) => {
    const inicio = Date.now()

    res.on('finish', () => {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio} ms)`)
    })

    next()
  })

  // Rutas públicas.
  app.use('/api/salud', rutasSalud)
  app.use('/api/auth', rutasAuth)

  // A partir de acá, todo /api exige sesión de administrador.
  app.use('/api', requiereAdmin)

  // Rutas protegidas de la API.
  app.use('/api/categorias', rutasCategorias)
  app.use('/api/articulos', rutasArticulos)
  app.use('/api/modelos', rutasModelos)
  app.use('/api/unidades', rutasUnidades)
  app.use('/api/dependencias', rutasDependencias)
  app.use('/api/oficinas', rutasOficinas)
  app.use('/api/movimientos', rutasMovimientos)

  // En producción, Express también entrega el React compilado.
  if (env.nodoEnv === 'production') {
    if (fs.existsSync(carpetaDist)) {
      app.use(express.static(carpetaDist))

      // Cualquier ruta que no sea /api devuelve index.html (React Router).
      app.use((req, res, next) => {
        if (req.method !== 'GET' || req.path.startsWith('/api')) {
          return next()
        }

        res.sendFile(path.join(carpetaDist, 'index.html'))
      })
    } else {
      console.warn('[server] No existe dist/. Ejecutá "npm run build" antes de iniciar en producción.')
    }
  }

  app.use(noEncontrado)
  app.use(manejarErrores)

  return app
}
