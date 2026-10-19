/**
 * Convierte una fecha ISO (YYYY-MM-DD) al formato local DD/MM/YYYY.
 * Si no tiene el formato esperado, la devuelve tal cual.
 */
export function formatearFecha(fecha) {
    if (!fecha) return '—'

    const texto = String(fecha)
    const [anio, mes, dia] = texto.split('-')

    if (!anio || !mes || !dia) return texto

    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`
}
