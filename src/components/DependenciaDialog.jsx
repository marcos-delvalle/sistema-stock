import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
} from '@mui/material'
import { useState } from 'react'

/**
 * Alta y edición de una dependencia (edificio).
 * La baja se bloquea si todavía tiene oficinas asignadas.
 */
function DependenciaDialog({ abierto, onCerrar, dependencia, oficinas, setDependencias }) {
    const editando = Boolean(dependencia)

    const [nombre, setNombre] = useState(dependencia?.nombre || '')
    const [error, setError] = useState('')

    function guardar() {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }

        if (editando) {
            setDependencias((prev) => prev.map((d) => (
                d.id === dependencia.id ? { ...d, nombre: nombre.trim() } : d
            )))
        } else {
            setDependencias((prev) => [...prev, { id: Date.now(), nombre: nombre.trim() }])
        }

        onCerrar()
    }

    function eliminar() {
        const cantidad = oficinas.filter((o) => o.dependencia_id === dependencia.id).length

        if (cantidad > 0) {
            setError(
                `No se puede eliminar: tiene ${cantidad} oficina${cantidad === 1 ? '' : 's'} asignada${cantidad === 1 ? '' : 's'}. ` +
                'Movelas a otra dependencia o eliminalas primero.'
            )
            return
        }

        if (!window.confirm(`¿Eliminar "${dependencia.nombre}"?`)) return

        setDependencias((prev) => prev.filter((d) => d.id !== dependencia.id))
        onCerrar()
    }

    return (
        <Dialog open={abierto} onClose={onCerrar} maxWidth="xs" fullWidth>
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

export default DependenciaDialog
