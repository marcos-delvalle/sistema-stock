import { ErrorHttp } from '../lib/http.js'

export function noEncontrado(req, res) {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  })
}

/**
 * Express reconoce este middleware por tener 4 parámetros.
 * Cualquier next(error) de la aplicación termina acá.
 */
export function manejarErrores(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const estado = error instanceof ErrorHttp ? error.estado : 500

  if (estado >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, error)
  }

  res.status(estado).json({
    error: estado >= 500 ? 'Error interno del servidor' : error.message,
  })
}
