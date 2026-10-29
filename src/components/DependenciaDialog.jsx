import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, TextField, Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useState } from 'react'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'

/**
 * Alta y edición de una dependencia (edificio).
 * La baja se bloquea si todavía tiene oficinas activas.
 * En modo edición permite abrir el alta de una oficina de esta dependencia.
 */
function DependenciaDialog({
    abierto, onCerrar, dependencia, oficinas, onAgregarOficina,
}) {
    const { recargar, notificar } = useDatos()
    const editando = Boolean(dependencia)

    const [nombre, setNombre] = useState(dependencia?.nombre || '')
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    const cantidadOficinas = dependencia
        ? oficinas.filter((o) => o.dependencia_id === dependencia.id && o.activo).length
        : 0

    async function guardar() {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }

        setGuardando(true)
        setError('')

        try {
            if (editando) {
                await api.put(`/dependencias/${dependencia.id}`, { nombre: nombre.trim() })
                notificar('Dependencia actualizada')
            } else {
                await api.post('/dependencias', { nombre: nombre.trim() })
                notificar('Dependencia creada')
            }

            await recargar()
            onCerrar()
        } catch (e) {
            setError(e.message)
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        const confirmado = window.confirm(
            `¿Dar de baja "${dependencia.nombre}"?`
        )

        if (!confirmado) return

        setGuardando(true)
        setError('')

        try {
            await api.delete(`/dependencias/${dependencia.id}`)
            notificar('Dependencia dada de baja')
            await recargar()
            onCerrar()
        } catch (e) {
            setError(e.message)
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="xs" fullWidth>
            <DialogTitle>{editando ? 'Editar dependencia' : 'Nueva dependencia'}</DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Nombre"
                        placeholder="Ej: Palacio Municipal"
                        value={nombre}
                        onChange={(e) => { setNombre(e.target.value); setError('') }}
                        autoFocus
                    />

                    {editando && onAgregarOficina && (
                        <>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Oficinas asignadas: {cantidadOficinas}
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<Add />}
                                    onClick={onAgregarOficina}
                                    disabled={guardando}
                                >
                                    Agregar oficina
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'space-between' }}>
                {editando && dependencia.activo ? (
                    <Button color="error" onClick={eliminar} disabled={guardando}>
                        Dar de baja
                    </Button>
                ) : (
                    <span />
                )}
                <Box>
                    <Button onClick={onCerrar} disabled={guardando}>Cancelar</Button>
                    <Button variant="contained" onClick={guardar} disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    )
}

export default DependenciaDialog
