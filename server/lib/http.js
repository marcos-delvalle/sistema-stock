/**
 * Error controlado que el middleware de errores convierte en una respuesta HTTP.
 * Ejemplo: throw new ErrorHttp(409, 'No hay stock suficiente')
 */
export class ErrorHttp extends Error {
  constructor(estado, mensaje) {
    super(mensaje)
    this.estado = estado
  }
}

/**
 * Envuelve un handler async para que cualquier error llegue a Express.
 * Sin esto, un await que falla deja la petición colgada.
 */
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}
