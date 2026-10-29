import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Tooltip, Typography,
} from '@mui/material'
import { Edit, OpenInNew } from '@mui/icons-material'
import { useState } from 'react'
import UnidadDialog from './UnidadDialog'

function OficinasAsignadasDialog({ abierto, onCerrar, unidades, modelo, oficinas }) {

    // undefined = formulario cerrado · null = creando · objeto = editando
    const [unidadEditando, setUnidadEditando] = useState(undefined)

    const asignadas = unidades.filter((u) => u.modelo_id === modelo?.id)

    function cerrar() {
        setUnidadEditando(undefined)
        onCerrar()
    }

    return (
        <>
            <Dialog open={abierto} onClose={cerrar} maxWidth="md" fullWidth>
                <DialogTitle>
                    {modelo ? `${modelo.marca} ${modelo.modelo}` : 'Impresora'}
                </DialogTitle>

                <DialogContent>
                    {asignadas.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                            Este modelo todavía no tiene unidades asignadas.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
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
