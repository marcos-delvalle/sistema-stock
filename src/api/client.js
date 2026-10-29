const BASE = '/api'

export class ApiError extends Error {
    constructor(mensaje, estado = 0) {
        super(mensaje)
        this.name = 'ApiError'
        this.estado = estado
    }
}

async function leerRespuesta(respuesta) {
    if (respuesta.status === 204) return null

    const texto = await respuesta.text()
    if (!texto) return null

    try {
        return JSON.parse(texto)
    } catch {
        return texto
    }
}

async function pedir(ruta, opciones = {}) {
    const { cuerpo, ...resto } = opciones

    const configuracion = {
        credentials: 'include',
        ...resto,
        headers: {
            ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(resto.headers || {}),
        },
    }

    if (cuerpo !== undefined) {
        configuracion.body = JSON.stringify(cuerpo)
    }

    let respuesta

    try {
        respuesta = await fetch(`${BASE}${ruta}`, configuracion)
    } catch {
        throw new ApiError(
            'No se pudo conectar con el servidor. Verificá que la API esté corriendo.',
            0
        )
    }

    const datos = await leerRespuesta(respuesta)

    if (!respuesta.ok) {
        const mensaje = datos && typeof datos === 'object' && datos.error
            ? datos.error
            : typeof datos === 'string' && datos
                ? datos
                : `Error ${respuesta.status}`

        throw new ApiError(mensaje, respuesta.status)
    }

    return datos
}

export const api = {
    get: (ruta) => pedir(ruta),
    post: (ruta, cuerpo) => pedir(ruta, { method: 'POST', cuerpo }),
    put: (ruta, cuerpo) => pedir(ruta, { method: 'PUT', cuerpo }),
    patch: (ruta, cuerpo) => pedir(ruta, { method: 'PATCH', cuerpo }),
    delete: (ruta) => pedir(ruta, { method: 'DELETE' }),
}
