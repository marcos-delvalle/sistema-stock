// Minúsculas y sin acentos, para que "Educacion" encuentre "Educación"
export function normalizar(texto) {
    return String(texto)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}
