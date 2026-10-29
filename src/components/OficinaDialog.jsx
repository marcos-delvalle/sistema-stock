import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    MenuItem, TextField,
} from '@mui/material'
import { useState } from 'react'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'

/**
 * Alta y edición de una oficina.
 * Permite moverla de dependencia y bloquea la baja si tiene impresoras asignadas.
 */
function OficinaDialog({
    abierto, onCerrar, oficina, dependenciaId, dependencias, unidades,
}) {
    const { recargar, notificar } = useDatos()
    const editando = Boolean(oficina)

    const [nombre, setNombre] = useState(oficina?.nombre || '')
    const [depId, setDepId] = useState(oficina?.dependencia_id ?? dependenciaId ?? '')
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    async function guardar() {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }
        if (!depId) {
            setError('Elegí una dependencia')
            return
        }

        setGuardando(true)
        setError('')

        try {
            const cuerpo = {
                nombre: nombre.trim(),
                dependencia_id: Number(depId),
            }

            if (editando) {
                await api.put(`/oficinas/${oficina.id}`, cuerpo)
                notificar('Oficina actualizada')
            } else {
                await api.post('/oficinas', cuerpo)
                notificar('Oficina creada')
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
        const cantidad = unidades.filter((u) => u.oficina_id === oficina.id).length

        if (cantidad > 0) {
            setError(
                `No se puede dar de baja: tiene ${cantidad} impresora${cantidad === 1 ? '' : 's'} asignada${cantidad === 1 ? '' : 's'}. ` +
                'Mové o eliminá esas unidades primero.'
            )
            return
        }

        if (!window.confirm(`¿Dar de baja "${oficina.nombre}"?`)) return

        setGuardando(true)
        setError('')

        try {
            await api.delete(`/oficinas/${oficina.id}`)
            notificar('Oficina dada de baja')
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
            <DialogTitle>{editando ? 'Editar oficina' : 'Nueva oficina'}</DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Nombre"
                        placeholder="Ej: Compras"
                        value={nombre}
                        onChange={(e) => { setNombre(e.target.value); setError('') }}
                        autoFocus
                    />

                    <TextField
                        select
                        label="Dependencia"
                        value={depId}
                        onChange={(e) => { setDepId(e.target.value); setError('') }}
                    >
                        {dependencias.map((d) => (
                            <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
                        ))}
                    </TextField>
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'space-between' }}>
                {editando && oficina.activo ? (
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

export default OficinaDialog
