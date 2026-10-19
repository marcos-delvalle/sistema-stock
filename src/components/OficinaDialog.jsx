import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    MenuItem, TextField,
} from '@mui/material'
import { useState } from 'react'

/**
 * Alta y edición de una oficina.
 * Permite moverla de dependencia y bloquea la baja si tiene impresoras asignadas.
 */
function OficinaDialog({
    abierto, onCerrar, oficina, dependenciaId, dependencias, unidades, setOficinas,
}) {
    const editando = Boolean(oficina)

    const [nombre, setNombre] = useState(oficina?.nombre || '')
    const [depId, setDepId] = useState(oficina?.dependencia_id ?? dependenciaId ?? '')
    const [error, setError] = useState('')

    function guardar() {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }
        if (!depId) {
            setError('Elegí una dependencia')
            return
        }

        if (editando) {
            setOficinas((prev) => prev.map((o) => (
                o.id === oficina.id
                    ? { ...o, nombre: nombre.trim(), dependencia_id: Number(depId) }
                    : o
            )))
        } else {
            setOficinas((prev) => [...prev, {
                id: Date.now(),
                nombre: nombre.trim(),
                dependencia_id: Number(depId),
            }])
        }

        onCerrar()
    }

    function eliminar() {
        const cantidad = unidades.filter((u) => u.oficina_id === oficina.id).length

        if (cantidad > 0) {
            setError(
                `No se puede eliminar: tiene ${cantidad} impresora${cantidad === 1 ? '' : 's'} asignada${cantidad === 1 ? '' : 's'}. ` +
                'Mové o eliminá esas unidades primero.'
            )
            return
        }

        if (!window.confirm(`¿Eliminar "${oficina.nombre}"?`)) return

        setOficinas((prev) => prev.filter((o) => o.id !== oficina.id))
        onCerrar()
    }

    return (
        <Dialog open={abierto} onClose={onCerrar} maxWidth="xs" fullWidth>
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
                {editando ? (
                    <Button color="error" onClick={eliminar}>Eliminar</Button>
                ) : (
                    <span />
                )}
                <Box>
                    <Button onClick={onCerrar}>Cancelar</Button>
                    <Button variant="contained" onClick={guardar}>Guardar</Button>
                </Box>
            </DialogActions>
        </Dialog>
    )
}

export default OficinaDialog
