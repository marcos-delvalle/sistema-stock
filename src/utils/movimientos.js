// Etiquetas y valores derivados de un movimiento, para que Historial y
// Dashboard muestren lo mismo para entradas, salidas y ajustes.

export function etiquetaTipo(tipo) {
    if (tipo === 'entrada') return 'Entrada'
    if (tipo === 'ajuste') return 'Ajuste'
    return 'Salida'
}

export function colorTipo(tipo) {
    if (tipo === 'entrada') return 'success'
    if (tipo === 'ajuste') return 'warning'
    return 'primary'
}

export function cantidadVisible(movimiento) {
    if (movimiento?.tipo !== 'ajuste') return movimiento?.cantidad

    const anterior = Number(movimiento.stock_anterior)
    const nuevo = Number(movimiento.stock_nuevo)

    if (!Number.isFinite(anterior) || !Number.isFinite(nuevo)) {
        return movimiento.cantidad
    }

    const delta = nuevo - anterior
    return `${delta > 0 ? '+' : ''}${delta}`
}

export function detalleAjuste(movimiento) {
    if (movimiento?.tipo !== 'ajuste') return ''

    const anterior = movimiento.stock_anterior
    const nuevo = movimiento.stock_nuevo
    const motivo = movimiento.motivo || 'Sin motivo'

    return `De ${anterior} a ${nuevo} · ${motivo}`
}

export function destinoVisible(movimiento, oficinas = []) {
    if (!movimiento) return '—'
    if (movimiento.tipo === 'entrada') return 'Depósito'

    if (movimiento.tipo === 'ajuste') {
        return movimiento.motivo ? `Ajuste: ${movimiento.motivo}` : 'Ajuste de stock'
    }

    return movimiento.oficina_nombre
        || oficinas.find((o) => o.id === movimiento.oficina_id)?.nombre
        || '—'
}
