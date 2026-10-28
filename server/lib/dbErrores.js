import { ErrorHttp } from './http.js'

/**
 * Traduce errores de PostgreSQL a respuestas HTTP entendibles.
 * Los códigos 23xxx son violaciones de restricciones (unique, foreign key, check).
 */
export function traducirErrorDb(error) {
  if (error instanceof ErrorHttp) return error

  if (error.code === '23505') {
    return new ErrorHttp(409, 'Ya existe un registro con ese valor único')
  }

  if (error.code === '23503') {
    return new ErrorHttp(409, 'La operación afecta registros relacionados y no se puede completar')
  }

  if (error.code === '23514') {
    return new ErrorHttp(400, 'Los datos no cumplen una regla de la base de datos')
  }

  return error
}
