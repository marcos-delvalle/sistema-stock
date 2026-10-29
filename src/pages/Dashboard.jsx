import {
    Avatar, Box, Button, Card, CardContent, Chip, LinearProgress, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tooltip, Typography,
} from '@mui/material'
import {
    Business, CalendarMonth, CheckCircle, History, Inventory2, Print,
    SwapHoriz, TrendingUp, WarningAmber,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { formatearFecha } from '../utils/fecha'

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Fecha de referencia de la sesión. Evita llamar a `new Date()` en cada render.
const HOY = new Date()

function claveDeFecha(fecha) {
    return String(fecha).slice(0, 7)
}

function ultimosMeses(cantidad) {
    return Array.from({ length: cantidad }, (_, i) => {
        const fecha = new Date(HOY.getFullYear(), HOY.getMonth() - (cantidad - 1 - i), 1)

        return {
            clave: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`,
            label: MESES_CORTOS[fecha.getMonth()],
        }
    })
}

function TarjetaKpi({ titulo, valor, detalle, Icono, color, onClick }) {
    return (
        <Card
            elevation={0}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                }
            }}
            sx={{
                position: 'relative',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                },
                '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                },
            }}
        >
            <CardContent sx={{ pb: '20px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {titulo}
                    </Typography>
                    <Avatar
                        variant="rounded"
                        sx={{ bgcolor: `${color}.main`, color: '#fff', width: 38, height: 38 }}
                    >
                        <Icono fontSize="small" />
                    </Avatar>
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                    {valor}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {detalle}
                </Typography>
            </CardContent>

            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, bgcolor: `${color}.main` }} />
        </Card>
    )
}

function EncabezadoPanel({ Icono, titulo, subtitulo, accion, colorIcono = 'primary' }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Icono color={colorIcono} fontSize="small" sx={{ mt: 0.3 }} />
                <Box>
                    <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{titulo}</Typography>
                    {subtitulo && (
                        <Typography variant="body2" color="text.secondary">{subtitulo}</Typography>
                    )}
                </Box>
            </Box>
            {accion}
        </Box>
    )
}

function Leyenda({ color, texto }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: color }} />
            <Typography variant="caption" color="text.secondary">{texto}</Typography>
        </Box>
    )
}

function Dashboard({
    articulos, movimientos, modelos, unidades, dependencias, oficinas, categorias,
}) {
    const navigate = useNavigate()

    const hoy = HOY
    const claveMesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`

    const activos = articulos.filter((a) => a.activo)
    const inactivos = articulos.length - activos.length

    const bajoStock = activos
        .filter((a) => a.stock_actual < a.stock_minimo)
        .sort((a, b) => (b.stock_minimo - b.stock_actual) - (a.stock_minimo - a.stock_actual))

    const sinStock = bajoStock.filter((a) => a.stock_actual === 0).length

    const unidadesActivas = unidades.filter((u) => u.estado === 'activa').length
    const unidadesInactivas = unidades.length - unidadesActivas

    const movimientosMes = movimientos.filter((m) => claveDeFecha(m.fecha) === claveMesActual)
    const entradasMes = movimientosMes.filter((m) => m.tipo === 'entrada').length
    const salidasMes = movimientosMes.filter((m) => m.tipo === 'salida').length

    // Agrupamos cantidades por mes una sola vez
    const movimientosPorMes = movimientos.reduce((acc, m) => {
        const clave = claveDeFecha(m.fecha)
        if (!acc[clave]) acc[clave] = { entradas: 0, salidas: 0 }

        const cantidad = Number(m.cantidad) || 0
        if (m.tipo === 'entrada') acc[clave].entradas += cantidad
        else if (m.tipo === 'salida') acc[clave].salidas += cantidad

        return acc
    }, {})

    const datosMeses = ultimosMeses(6).map(({ clave, label }) => ({
        clave,
        label,
        entradas: movimientosPorMes[clave]?.entradas || 0,
        salidas: movimientosPorMes[clave]?.salidas || 0,
    }))

    const maxMovimiento = Math.max(
        1,
        ...datosMeses.flatMap((m) => [m.entradas, m.salidas])
    )

    const recientes = [...movimientos]
        .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)) || b.id - a.id)
        .slice(0, 6)

    const dependenciasActivas = dependencias.filter((d) => d.activo)
    const oficinasActivas = oficinas.filter((o) => o.activo)

    const porDependencia = dependenciasActivas
        .map((dep) => {
            const idsOficinas = oficinasActivas
                .filter((o) => o.dependencia_id === dep.id)
                .map((o) => o.id)

            const asignadas = unidades.filter((u) => idsOficinas.includes(u.oficina_id))

            return {
                ...dep,
                total: asignadas.length,
                activas: asignadas.filter((u) => u.estado === 'activa').length,
            }
        })
        .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, 'es'))

    const maxDependencia = Math.max(1, ...porDependencia.map((d) => d.total))

    function nombreCategoria(id) {
        return categorias.find((c) => c.id === id)?.nombre || 'Sin categoría'
    }

    function destinoDe(m) {
        if (m.tipo === 'entrada') return 'Depósito'
        return m.oficina_nombre || oficinas.find((o) => o.id === m.oficina_id)?.nombre || '—'
    }

    const detalleArticulos = inactivos > 0
        ? `${activos.length} activos · ${inactivos} inactivo${inactivos === 1 ? '' : 's'}`
        : `${activos.length} activos · ${categorias.length} categorías`

    const detalleBajoStock = bajoStock.length === 0
        ? 'Todo el stock está en orden'
        : sinStock > 0
            ? `${sinStock} sin stock · mínimo no alcanzado`
            : 'Por debajo del stock mínimo'

    const detalleImpresoras = unidades.length === 0
        ? 'Sin unidades asignadas'
        : unidadesInactivas > 0
            ? `${modelos.length} modelos · ${unidadesInactivas} inactiva${unidadesInactivas === 1 ? '' : 's'}`
            : `${modelos.length} modelos · todas activas`

    const detalleMovimientos = movimientosMes.length === 0
        ? 'Sin movimientos este mes'
        : `${entradasMes} entrada${entradasMes === 1 ? '' : 's'} · ${salidasMes} salida${salidasMes === 1 ? '' : 's'}`

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Box>
                    <Typography variant="h4">Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Resumen general del stock y del parque de impresoras.
                    </Typography>
                </Box>
                <Chip
                    icon={<CalendarMonth />}
                    variant="outlined"
                    label={hoy.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                />
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                    gap: 2,
                    mb: 2,
                }}
            >
                <TarjetaKpi
                    titulo="Artículos"
                    valor={articulos.length}
                    detalle={detalleArticulos}
                    Icono={Inventory2}
                    color="primary"
                    onClick={() => navigate('/articulos')}
                />
                <TarjetaKpi
                    titulo="Bajo stock"
                    valor={bajoStock.length}
                    detalle={detalleBajoStock}
                    Icono={bajoStock.length > 0 ? WarningAmber : CheckCircle}
                    color={bajoStock.length > 0 ? 'error' : 'success'}
                    onClick={() => navigate('/articulos')}
                />
                <TarjetaKpi
                    titulo="Impresoras"
                    valor={unidades.length}
                    detalle={detalleImpresoras}
                    Icono={Print}
                    color="info"
                    onClick={() => navigate('/impresoras')}
                />
                <TarjetaKpi
                    titulo="Movimientos del mes"
                    valor={movimientosMes.length}
                    detalle={detalleMovimientos}
                    Icono={SwapHoriz}
                    color="warning"
                    onClick={() => navigate('/historial')}
                />
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                    gap: 2,
                    mb: 2,
                }}
            >
                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
                    <EncabezadoPanel
                        Icono={TrendingUp}
                        titulo="Actividad de los últimos 6 meses"
                        subtitulo="Unidades movidas por mes"
                    />

                    <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                        <Leyenda color="success.main" texto="Entradas" />
                        <Leyenda color="primary.main" texto="Salidas" />
                    </Box>

                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'flex-end', height: 210 }}>
                        {datosMeses.map((m) => (
                            <Box
                                key={m.clave}
                                sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                <Box
                                    sx={{
                                        height: 180,
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                    }}
                                >
                                    <Tooltip title={`${m.entradas} unidades de entrada`}>
                                        <Box
                                            sx={{
                                                width: { xs: 8, sm: 12 },
                                                height: `${(m.entradas / maxMovimiento) * 100}%`,
                                                minHeight: m.entradas > 0 ? 4 : 0,
                                                bgcolor: 'success.main',
                                                borderRadius: '3px 3px 0 0',
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title={`${m.salidas} unidades de salida`}>
                                        <Box
                                            sx={{
                                                width: { xs: 8, sm: 12 },
                                                height: `${(m.salidas / maxMovimiento) * 100}%`,
                                                minHeight: m.salidas > 0 ? 4 : 0,
                                                bgcolor: 'primary.main',
                                                borderRadius: '3px 3px 0 0',
                                            }}
                                        />
                                    </Tooltip>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {m.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>

                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
                    <EncabezadoPanel
                        Icono={bajoStock.length > 0 ? WarningAmber : CheckCircle}
                        colorIcono={bajoStock.length > 0 ? 'error' : 'success'}
                        titulo="Alertas de stock"
                        subtitulo="Artículos por debajo del mínimo"
                        accion={bajoStock.length > 0 ? (
                            <Chip size="small" color="error" label={bajoStock.length} />
                        ) : null}
                    />

                    {bajoStock.length === 0 ? (
                        <Box sx={{ py: 5, textAlign: 'center' }}>
                            <CheckCircle color="success" sx={{ fontSize: 42, mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Todo el stock está por encima del mínimo.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ maxHeight: 244, overflowY: 'auto', pr: 0.5 }}>
                                {bajoStock.map((a) => {
                                    const porcentaje = a.stock_minimo > 0
                                        ? Math.min(100, Math.round((a.stock_actual / a.stock_minimo) * 100))
                                        : 100

                                    return (
                                        <Box
                                            key={a.id}
                                            onClick={() => navigate('/articulos')}
                                            sx={{
                                                p: 1,
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: 'action.hover' },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                                        {a.nombre}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {nombreCategoria(a.categoria_id)} · mínimo {a.stock_minimo}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    size="small"
                                                    color={a.stock_actual === 0 ? 'error' : 'warning'}
                                                    label={a.stock_actual === 0 ? 'Sin stock' : `${a.stock_actual} / ${a.stock_minimo}`}
                                                />
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={porcentaje}
                                                color={a.stock_actual === 0 ? 'error' : 'warning'}
                                                sx={{ mt: 0.75, height: 4, borderRadius: 2 }}
                                            />
                                        </Box>
                                    )
                                })}
                            </Box>
                            <Button variant='outlined' size="small" onClick={() => navigate('/articulos')} sx={{ mt: 1 }}>
                                Ver artículos
                            </Button>
                        </>
                    )}
                </Paper>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2 }}>
                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
                    <EncabezadoPanel
                        Icono={History}
                        titulo="Últimos movimientos"
                        subtitulo="Los 6 registros más recientes"
                        accion={
                            <Button variant='outlined' size="small" onClick={() => navigate('/historial')}>
                                Ver historial
                            </Button>
                        }
                    />

                    {recientes.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            Todavía no hay movimientos registrados.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Artículo</TableCell>
                                        <TableCell>Tipo</TableCell>
                                        <TableCell align="right">Cant.</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                            Destino
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recientes.map((m) => (
                                        <TableRow
                                            key={m.id}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => navigate('/historial')}
                                        >
                                            <TableCell>{formatearFecha(m.fecha)}</TableCell>
                                            <TableCell>
                                                {m.articulo_nombre || articulos.find((a) => a.id === m.articulo_id)?.nombre || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                                                    color={m.tipo === 'entrada' ? 'success' : 'primary'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">{m.cantidad}</TableCell>
                                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                                {destinoDe(m)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
                    <EncabezadoPanel
                        Icono={Business}
                        titulo="Impresoras por dependencia"
                        subtitulo={`${unidadesActivas} activas de ${unidades.length} unidades`}
                    />

                    {porDependencia.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            Todavía no hay dependencias cargadas.
                        </Typography>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {porDependencia.map((dep) => (
                                    <Box
                                        key={dep.id}
                                        onClick={() => navigate('/dependencias')}
                                        sx={{
                                            p: 1,
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.hover' },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                                {dep.nombre}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                                {dep.total}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(dep.total / maxDependencia) * 100}
                                            sx={{ mt: 0.75, height: 6, borderRadius: 3 }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {dep.total === 0
                                                ? 'Sin impresoras'
                                                : `${dep.activas} activa${dep.activas === 1 ? '' : 's'} de ${dep.total}`}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Button variant='outlined' size="small" onClick={() => navigate('/dependencias')} sx={{ mt: 1 }}>
                                Ver dependencias
                            </Button>
                        </>
                    )}
                </Paper>
            </Box>
        </>
    )
}

export default Dashboard
