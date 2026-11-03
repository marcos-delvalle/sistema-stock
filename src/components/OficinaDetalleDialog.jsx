import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Paper, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Tabs, Tooltip, Typography, useMediaQuery,
} from '@mui/material'
import { Add, Edit, OpenInNew } from '@mui/icons-material'
import { useState } from 'react'
import UnidadDialog from './UnidadDialog'
import { formatearFecha } from '../utils/fecha'

/**
 * Detalle de una oficina: impresoras asignadas e historial de salidas.
 * Se monta desde cero cada vez que se abre (ver Dependencias.jsx),
 * así la pestaña activa y los formularios arrancan limpios.
 */
function OficinaDetalleDialog({
    abierto, onCerrar, oficina, dependencia, unidades, modelos,
    oficinas, articulos, movimientos,
}) {
    const [tab, setTab] = useState(0)
    const esMovil = useMediaQuery('(max-width:599.95px)')

    // undefined = formulario cerrado · null = creando · objeto = editando
    const [unidadEditando, setUnidadEditando] = useState(undefined)

    const asignadas = unidades.filter((u) => u.oficina_id === oficina.id)

    const historial = movimientos
        .filter((m) => m.oficina_id === oficina.id && m.tipo === 'salida')
        .sort((a, b) => (
            String(b.fecha).localeCompare(String(a.fecha)) || b.id - a.id
        ))

    return (
        <>
            <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth fullScreen={esMovil}>
                <DialogTitle>
                    {oficina.nombre}
                    <Typography variant="body2" color="text.secondary">
                        {dependencia?.nombre || 'Sin dependencia'}
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <Tabs
                        value={tab}
                        onChange={(e, nuevo) => setTab(nuevo)}
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label={`Impresoras (${asignadas.length})`} />
                        <Tab label={`Historial (${historial.length})`} />
                    </Tabs>

                    {tab === 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    alignItems: { xs: 'stretch', sm: 'center' },
                                    gap: 1,
                                    mb: 1,
                                }}
                            >
                                <Typography variant="subtitle1">Impresoras asignadas</Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={() => setUnidadEditando(null)}
                                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                                >
                                    Agregar impresora
                                </Button>
                            </Box>

                            {asignadas.length === 0 ? (
                                <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                                    Esta oficina todavía no tiene impresoras asignadas.
                                </Typography>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            display: { xs: 'flex', sm: 'none' },
                                            flexDirection: 'column',
                                            gap: 1.5,
                                        }}
                                    >
                                        {asignadas.map((u) => {
                                            const modelo = modelos.find((m) => m.id === u.modelo_id)

                                            return (
                                                <Paper
                                                    key={u.id}
                                                    variant="outlined"
                                                    sx={{ p: 1.5, borderRadius: 2 }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{ fontWeight: 600 }}
                                                            >
                                                                {modelo ? `${modelo.marca} ${modelo.modelo}` : '—'}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {u.nombre || '—'}
                                                            </Typography>
                                                        </Box>
                                                        <Tooltip title="Editar unidad">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setUnidadEditando(u)}
                                                                aria-label="Editar unidad"
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.75,
                                                            flexWrap: 'wrap',
                                                            mt: 1,
                                                        }}
                                                    >
                                                        <Chip
                                                            size="small"
                                                            label={u.estado}
                                                            color={u.estado === 'activa' ? 'success' : 'default'}
                                                        />
                                                        {u.ip ? (
                                                            <>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {u.ip}
                                                                </Typography>
                                                                <Tooltip title="Abrir en el navegador">
                                                                    <IconButton
                                                                        size="small"
                                                                        component="a"
                                                                        href={u.ip.startsWith('http') ? u.ip : `http://${u.ip}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        aria-label={`Abrir ${u.ip}`}
                                                                    >
                                                                        <OpenInNew fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Sin IP
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Paper>
                                            )
                                        })}
                                    </Box>

                                    <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
                                        <Table
                                            size="small"
                                            sx={{
                                                minWidth: 520,
                                                '& .MuiTableCell-root': { px: { xs: 1, sm: 2 } },
                                            }}
                                        >
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Modelo</TableCell>
                                                    <TableCell>Nombre</TableCell>
                                                    <TableCell>IP</TableCell>
                                                    <TableCell>Estado</TableCell>
                                                    <TableCell align="right">Acciones</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {asignadas.map((u) => {
                                                    const modelo = modelos.find((m) => m.id === u.modelo_id)

                                                    return (
                                                        <TableRow key={u.id}>
                                                            <TableCell>
                                                                {modelo ? `${modelo.marca} ${modelo.modelo}` : '—'}
                                                            </TableCell>
                                                            <TableCell>{u.nombre || '—'}</TableCell>
                                                            <TableCell>
                                                                {u.ip ? (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        {u.ip}
                                                                        <Tooltip title="Abrir en el navegador">
                                                                            <IconButton
                                                                                size="small"
                                                                                component="a"
                                                                                href={u.ip.startsWith('http') ? u.ip : `http://${u.ip}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                <OpenInNew fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                ) : '—'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="small"
                                                                    label={u.estado}
                                                                    color={u.estado === 'activa' ? 'success' : 'default'}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Tooltip title="Editar unidad">
                                                                    <IconButton size="small" onClick={() => setUnidadEditando(u)}>
                                                                        <Edit fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </Box>
                    )}

                    {tab === 1 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Se muestran las salidas (entregas) registradas para esta oficina.
                            </Typography>

                            {historial.length === 0 ? (
                                <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                                    No hay movimientos de salida para esta oficina.
                                </Typography>
                            ) : (
                                <TableContainer>
                                    <Table
                                        size="small"
                                        sx={{
                                            minWidth: 0,
                                            '& .MuiTableCell-root': { px: { xs: 1, sm: 2 } },
                                        }}
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Fecha</TableCell>
                                                <TableCell>Artículo</TableCell>
                                                <TableCell align="right">Cantidad</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historial.map((m) => (
                                                <TableRow key={m.id}>
                                                    <TableCell>{formatearFecha(m.fecha)}</TableCell>
                                                    <TableCell>
                                                        {m.articulo_nombre || articulos.find((a) => a.id === m.articulo_id)?.nombre || '—'}
                                                    </TableCell>
                                                    <TableCell align="right">{m.cantidad}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onCerrar}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Se monta desde cero para que el formulario arranque limpio */}
            {unidadEditando !== undefined && (
                <UnidadDialog
                    abierto
                    onCerrar={() => setUnidadEditando(undefined)}
                    modelos={modelos}
                    modelo={unidadEditando ? modelos.find((m) => m.id === unidadEditando.modelo_id) : null}
                    unidad={unidadEditando}
                    oficinas={oficinas}
                    oficinaIdInicial={oficina.id}
                />
            )}
        </>
    )
}

export default OficinaDetalleDialog
