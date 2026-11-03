import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Tooltip, Typography, useMediaQuery,
} from '@mui/material'
import { Edit, OpenInNew } from '@mui/icons-material'
import { useState } from 'react'
import UnidadDialog from './UnidadDialog'

function OficinasAsignadasDialog({ abierto, onCerrar, unidades, modelo, oficinas }) {

    // undefined = formulario cerrado · null = creando · objeto = editando
    const [unidadEditando, setUnidadEditando] = useState(undefined)
    const esMovil = useMediaQuery('(max-width:599.95px)')

    const asignadas = unidades.filter((u) => u.modelo_id === modelo?.id)

    function cerrar() {
        setUnidadEditando(undefined)
        onCerrar()
    }

    return (
        <>
            <Dialog open={abierto} onClose={cerrar} maxWidth="md" fullWidth fullScreen={esMovil}>
                <DialogTitle>
                    {modelo ? `${modelo.marca} ${modelo.modelo}` : 'Impresora'}
                </DialogTitle>

                <DialogContent>
                    {asignadas.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                            Este modelo todavía no tiene unidades asignadas.
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
                                    const oficina = oficinas.find((o) => o.id === u.oficina_id)

                                    return (
                                        <Paper key={u.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{ fontWeight: 600, lineHeight: 1.3 }}
                                                    >
                                                        {u.nombre || '—'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {oficina?.nombre || 'Sin oficina'}
                                                    </Typography>
                                                </Box>
                                                <Tooltip title="Editar unidad">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setUnidadEditando(u)}
                                                        aria-label={`Editar ${u.nombre || 'unidad'}`}
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
                                            <TableCell>Nombre</TableCell>
                                            <TableCell>Oficina</TableCell>
                                            <TableCell>IP</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell align="right">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {asignadas.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell>{u.nombre || '—'}</TableCell>
                                                <TableCell>
                                                    {oficinas.find((o) => o.id === u.oficina_id)?.nombre || '—'}
                                                </TableCell>
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
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Total asignadas: {asignadas.length}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={cerrar}>Cerrar</Button>
                    <Button variant="contained" onClick={() => setUnidadEditando(null)}>
                        Agregar unidad
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Se monta desde cero cada vez que se abre, así los campos arrancan limpios */}
            {unidadEditando !== undefined && (
                <UnidadDialog
                    abierto
                    onCerrar={() => setUnidadEditando(undefined)}
                    modelo={modelo}
                    unidad={unidadEditando}
                    oficinas={oficinas}
                />
            )}
        </>
    )
}

export default OficinasAsignadasDialog
