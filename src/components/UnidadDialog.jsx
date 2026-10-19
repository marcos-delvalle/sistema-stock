import {
    Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, MenuItem, TextField,
} from '@mui/material'
import { useState } from 'react'

/**
 * Formulario para crear o editar una unidad (impresora física).
 * - `unidad` null/undefined -> crear (nombre por defecto = modelo)
 * - `unidad` objeto         -> editar
 *
 * Props opcionales:
 * - `modelos`: muestra un selector de modelo (se usa al agregar desde una oficina)
 * - `oficinaIdInicial`: precarga la oficina (se usa al agregar desde una oficina)
 */
function UnidadDialog({
    abierto, onCerrar, modelo, unidad, oficinas, setUnidades,
    modelos, oficinaIdInicial,
}) {

    const editando = Boolean(unidad)

    const [modeloId, setModeloId] = useState(unidad?.modelo_id ?? modelo?.id ?? '')
    const [nombre, setNombre] = useState(unidad?.nombre || modelo?.modelo || '')
    const [oficinaId, setOficinaId] = useState(unidad?.oficina_id ?? oficinaIdInicial ?? '')
    const [ip, setIp] = useState(unidad?.ip || '')
    const [estado, setEstado] = useState(unidad?.estado || 'activa')
    const [error, setError] = useState('')

    // Si nos pasan la lista de modelos, el modelo se elige dentro del diálogo.
    // Si no, queda fijo al modelo desde el que se abrió (caso Impresoras).
    const modeloSeleccionado = modelos
        ? modelos.find((m) => m.id === Number(modeloId))
        : modelo

    function guardar() {
        if (!nombre.trim() || !oficinaId || !modeloSeleccionado) {
            setError('Completá el modelo, el nombre y la oficina.')
            return
        }

        if (editando) {
            setUnidades((prev) => prev.map((u) => (
                u.id === unidad.id
                    ? {
                        ...u,
                        modelo_id: modeloSeleccionado.id,
                        nombre: nombre.trim(),
                        oficina_id: Number(oficinaId),
                        ip: ip.trim(),
                        estado,
                    }
                    : u
            )))
        } else {
            setUnidades((prev) => [...prev, {
                id: Date.now(),
                modelo_id: modeloSeleccionado.id,
                nombre: nombre.trim(),
                oficina_id: Number(oficinaId),
                ip: ip.trim(),
                estado,
            }])
        }

        onCerrar()
    }

    return (
        <Dialog open={abierto} onClose={onCerrar} maxWidth="xs" fullWidth>
            <DialogTitle>
                {editando ? 'Editar unidad' : 'Nueva unidad'}
                {modeloSeleccionado ? ` · ${modeloSeleccionado.marca} ${modeloSeleccionado.modelo}` : ''}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    {modelos && (
                        <Autocomplete
                            options={modelos}
                            getOptionLabel={(m) => `${m.marca} ${m.modelo}`}
                            value={modeloSeleccionado || null}
                            onChange={(e, nuevo) => {
                                setModeloId(nuevo ? nuevo.id : '')
                                // Si el nombre está vacío, lo completamos con el modelo elegido
                                if (!nombre.trim() && nuevo) {
                                    setNombre(`${nuevo.marca} ${nuevo.modelo}`)
                                }
                                setError('')
                            }}
                            renderInput={(params) => <TextField {...params} label="Modelo de impresora" />}
                        />
                    )}

                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => { setNombre(e.target.value); setError('') }}
                    />

                    <Autocomplete
                        options={oficinas}
                        getOptionLabel={(o) => o.nombre}
                        value={oficinas.find((o) => o.id === Number(oficinaId)) || null}
                        onChange={(e, nueva) => { setOficinaId(nueva ? nueva.id : ''); setError('') }}
                        renderInput={(params) => <TextField {...params} label="Oficina" />}
                    />

                    <TextField
                        label="IP"
                        placeholder="192.168.0.10"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                    />

                    <TextField
                        select
                        label="Estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                    >
                        <MenuItem value="activa">Activa</MenuItem>
                        <MenuItem value="inactiva">Inactiva</MenuItem>
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={guardar}>Guardar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default UnidadDialog
