import { crearApp } from './app.js'
import { cerrarPool, probarConexion } from './db/pool.js'
import { env } from './lib/env.js'

const app = crearApp()

const servidor = app.listen(env.puerto, '0.0.0.0', async () => {
  console.log(`[server] API escuchando en http://localhost:${env.puerto}`)
  console.log(`[server] Red local:      http://<IP-de-tu-PC>:${env.puerto}`)

  const baseDeDatos = await probarConexion()

  if (baseDeDatos) {
    console.log('[db] Conexión establecida con PostgreSQL')
  } else {
    console.warn('[db] No se pudo conectar. Revisá DATABASE_URL en server/.env')
  }
})

async function apagar(senal) {
  console.log(`\n[server] ${senal} recibido. Cerrando...`)

  servidor.close(async () => {
    await cerrarPool()
    process.exit(0)
  })
}

process.on('SIGINT', () => apagar('SIGINT'))
process.on('SIGTERM', () => apagar('SIGTERM'))
