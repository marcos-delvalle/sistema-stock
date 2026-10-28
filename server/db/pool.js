import pg from 'pg'
import { env } from '../lib/env.js'

const { Pool, types } = pg

// PostgreSQL devuelve las columnas DATE como objetos Date de JavaScript,
// con la hora local y posibles corrimientos de zona horaria.
// Las dejamos como texto 'YYYY-MM-DD' para que el front las muestre tal cual.
types.setTypeParser(1082, (valor) => valor)

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

/**
 * Algunos errores de conexión llegan como AggregateError (IPv4 + IPv6)
 * y traen el mensaje vacío. Esto arma un texto útil para el log.
 */
function describirError(error) {
  if (error instanceof AggregateError) {
    return error.errors
      .map((interno) => interno.message || interno.code || String(interno))
      .join(' | ')
  }

  return error.message || error.code || String(error)
}

pool.on('error', (error) => {
  console.error('[db] Error en un cliente inactivo:', describirError(error))
})

/**
 * Atajo para ejecutar una consulta parametrizada.
 * SIEMPRE usar $1, $2... y pasar los valores en el array.
 */
export function consultar(texto, parametros = []) {
  return pool.query(texto, parametros)
}

export async function probarConexion() {
  try {
    const { rows } = await pool.query('SELECT 1 AS ok')
    return rows[0]?.ok === 1
  } catch (error) {
    console.error('[db] Sin conexión:', describirError(error))
    return false
  }
}

export function cerrarPool() {
  return pool.end()
}
