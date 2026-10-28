import { pool } from '../db/pool.js'

/**
 * Ejecuta varias consultas dentro de una transacción.
 * Si el callback lanza un error, se hace ROLLBACK y no queda nada a medias.
 *
 * Uso:
 *   const resultado = await enTransaccion(async (cliente) => {
 *     await cliente.query('...')
 *     return ...
 *   })
 */
export async function enTransaccion(callback) {
  const cliente = await pool.connect()

  try {
    await cliente.query('BEGIN')
    const resultado = await callback(cliente)
    await cliente.query('COMMIT')
    return resultado
  } catch (error) {
    try {
      await cliente.query('ROLLBACK')
    } catch (errorRollback) {
      console.error('[db] Error al hacer ROLLBACK:', errorRollback.message)
    }

    throw error
  } finally {
    cliente.release()
  }
}
