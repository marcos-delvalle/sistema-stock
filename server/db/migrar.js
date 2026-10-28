import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cerrarPool, pool } from './pool.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const archivoEsquema = path.join(__dirname, 'esquema.sql')

async function migrar() {
  const sql = await fs.readFile(archivoEsquema, 'utf8')
  console.log('[db] Aplicando esquema...')

  const cliente = await pool.connect()

  try {
    await cliente.query(sql)
    console.log('[db] Esquema aplicado correctamente.')
  } catch (error) {
    console.error('[db] Error al aplicar el esquema:', error.message)
    process.exitCode = 1
  } finally {
    cliente.release()
    await cerrarPool()
  }
}

migrar()
