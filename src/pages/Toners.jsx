import {
    Box, Button, Card, CardActions, CardContent, Chip, LinearProgress,
    Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TableSortLabel, Tabs, Typography,
} from '@mui/material'
import { Edit, Print } from '@mui/icons-material'
import { useState } from 'react'
import TonerDialog from '../components/TonerDialog'
import Buscador from '../components/Buscador'
import EncabezadoPagina from '../components/EncabezadoPagina'
import { formatearFecha } from '../utils/fecha'
import { normalizar } from '../utils/texto'

function Toners({
    articulos, modelos, unidades, categorias, movimientos = [], oficinas = [],
}) {

    const [tonerEditando, setTonerEditando] = useState(null)
    const [dialogoAbierto, setDialogoAbierto] = useState(false)
    const [versionDialogo, setVersionDialogo] = useState(0)
    const [busqueda, setBusqueda] = useState('')
    const [tab, setTab] = useState(0)
    const [ordenFecha, setOrdenFecha] = useState('desc')

    // Buscamos la categoría de tóners por nombre, sin distinguir acentos.
    const catToner = categorias.find((c) => normalizar(c.nombre) === 'toner')
    const toners = articulos.filter((a) => a.categoria_id === catToner?.id)

    const termino = normalizar(busqueda)

    const filtrados = toners.filter((t) => {
        if (!termino) return true
        if (normalizar(t.nombre).includes(termino)) return true

        return modelos
            .filter((m) => m.articulo_id === t.id)
            .some((m) => normalizar(`${m.marca} ${m.modelo}`).includes(termino))
    })

    const fallados = movimientos
        .filter((m) => m.reporta_falla && m.tipo === 'salida')
        .map((m) => ({
            ...m,
            tonerNombre: m.articulo_nombre
                || articulos.find((a) => a.id === m.articulo_id)?.nombre
                || '—',
            oficinaNombre: m.oficina_nombre
                || oficinas.find((o) => o.id === m.oficina_id)?.nombre
                || '—',
        }))

    const falladosFiltrados = fallados
        .filter((m) => {
            if (!termino) return true
            return [m.tonerNombre, m.oficinaNombre]
                .some((texto) => normalizar(texto).includes(termino))
        })
        .sort((a, b) => {
            const comparacion = String(a.fecha).localeCompare(String(b.fecha)) || a.id - b.id
            return ordenFecha === 'asc' ? comparacion : -comparacion
        })

    function abrirNuevo() {
        setTonerEditando(null)
        setVersionDialogo((v) => v + 1)
        setDialogoAbierto(true)
    }

    function abrirEdicion(t) {
        setTonerEditando(t)
        setVersionDialogo((v) => v + 1)
        setDialogoAbierto(true)
    }

    return (
        <>
            <EncabezadoPagina
                titulo="Tóners"
                acciones={tab === 0
                    ? <Button variant="contained" onClick={abrirNuevo}>Nuevo tóner</Button>
                    : null}
            />

            <Tabs
                value={tab}
                onChange={(e, nuevo) => setTab(nuevo)}
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Stock" />
                <Tab label={`Tóners fallados (${fallados.length})`} />
            </Tabs>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Buscador
                    valor={busqueda}
                    onChange={setBusqueda}
                    placeholder={tab === 0
                        ? 'Buscar por tóner o impresora compatible...'
                        : 'Buscar por tóner u oficina...'}
                />
                {termino && (
                    <Typography variant="body2" color="text.secondary">
                        {tab === 0
                            ? `${filtrados.length} tóner${filtrados.length === 1 ? '' : 'es'}`
                            : `${falladosFiltrados.length} fallado${falladosFiltrados.length === 1 ? '' : 's'}`}
                    </Typography>
                )}
            </Box>

            <TonerDialog
                key={`${tonerEditando?.id ?? 'nuevo-toner'}-${versionDialogo}`}
                abierto={dialogoAbierto}
                onCerrar={() => setDialogoAbierto(false)}
                toner={tonerEditando}
                categoriaId={catToner?.id}
                articulos={articulos}
                modelos={modelos}
            />

            {tab === 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'stretch' }}>
                    {filtrados.map((t) => {
                        const modelosCompatibles = modelos.filter((m) => m.articulo_id === t.id)

                        const instaladas = unidades.filter((u) =>
                            modelosCompatibles.some((m) => m.id === u.modelo_id)
                        ).length

                        const bajoStock = t.stock_actual < t.stock_minimo
                        const porcentaje = t.stock_minimo > 0
                            ? Math.min(100, Math.round((t.stock_actual / t.stock_minimo) * 100))
                            : 100

                        return (
                            <Card
                                key={t.id}
                                sx={{
                                    width: { xs: '100%', sm: 340 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderTop: '4px solid',
                                    borderTopColor: !t.activo
                                        ? 'grey.400'
                                        : bajoStock ? 'error.main' : 'success.main',
                                    opacity: t.activo ? 1 : 0.7,
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                        <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                                            {t.nombre}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={t.activo ? 'Activo' : 'Inactivo'}
                                            color={t.activo ? 'success' : 'default'}
                                            variant={t.activo ? 'filled' : 'outlined'}
                                        />
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                                            <Typography
                                                variant="h4"
                                                sx={{ fontWeight: 600, color: bajoStock ? 'error.main' : 'text.primary' }}
                                            >
                                                {t.stock_actual}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                / mín {t.stock_minimo}
                                            </Typography>
                                            {bajoStock && <Chip size="small" color="error" label="Bajo stock" />}
                                        </Box>

                                        <LinearProgress
                                            variant="determinate"
                                            value={porcentaje}
                                            color={bajoStock ? 'error' : 'success'}
                                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                        />
                                    </Box>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block', mt: 2, mb: 0.5, fontWeight: 600, letterSpacing: 0.4 }}
                                    >
                                        IMPRESORAS COMPATIBLES
                                    </Typography>

                                    {modelosCompatibles.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Ninguna
                                        </Typography>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {modelosCompatibles.map((m) => (
                                                <Chip
                                                    key={m.id}
                                                    size="small"
                                                    variant="outlined"
                                                    icon={<Print fontSize="small" />}
                                                    label={`${m.marca} ${m.modelo}`}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                                        Unidades instaladas: <strong>{instaladas}</strong>
                                    </Typography>
                                </CardContent>

                                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                    <Button size="small" startIcon={<Edit />} onClick={() => abrirEdicion(t)}>
                                        Editar
                                    </Button>
                                </CardActions>
                            </Card>
                        )
                    })}

                    {toners.length === 0 && (
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                            Todavía no hay tóners cargados.
                        </Typography>
                    )}

                    {toners.length > 0 && filtrados.length === 0 && (
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                            No se encontraron tóners para "{busqueda.trim()}".
                        </Typography>
                    )}
                </Box>
            )}

            {tab === 1 && (
                falladosFiltrados.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            {termino
                                ? `No se encontraron tóners fallados para "${busqueda.trim()}".`
                                : 'Todavía no hay tóners reportados como fallados.'}
                        </Typography>
                    </Paper>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: { xs: 'flex', sm: 'none' },
                                flexDirection: 'column',
                                gap: 1.5,
                            }}
                        >
                            {falladosFiltrados.map((m) => (
                                <Paper key={m.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            {formatearFecha(m.fecha)}
                                        </Typography>
                                        <Chip size="small" color="warning" label="Falla" />
                                    </Box>

                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 600, mt: 0.5, lineHeight: 1.3 }}
                                    >
                                        {m.tonerNombre}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {m.oficinaNombre}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>

                        <TableContainer
                            component={Paper}
                            sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                            <Table sx={{ minWidth: 520 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sortDirection={ordenFecha}>
                                            <TableSortLabel
                                                active
                                                direction={ordenFecha}
                                                onClick={() => setOrdenFecha((prev) => (
                                                    prev === 'asc' ? 'desc' : 'asc'
                                                ))}
                                            >
                                                Fecha
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>Tóner</TableCell>
                                        <TableCell>Oficina</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {falladosFiltrados.map((m) => (
                                        <TableRow key={m.id}>
                                            <TableCell>{formatearFecha(m.fecha)}</TableCell>
                                            <TableCell>{m.tonerNombre}</TableCell>
                                            <TableCell>{m.oficinaNombre}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )
            )}
        </>
    )
}
export default Toners
