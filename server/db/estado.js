import { cerrarPool, probarConexion } from './pool.js'

const conectada = await probarConexion()

if (conectada) {
  console.log('[db] Conexión OK')
} else {
  console.error('[db] No se pudo conectar con PostgreSQL. Revisá DATABASE_URL en server/.env')
  process.exitCode = 1
}

await cerrarPool()
