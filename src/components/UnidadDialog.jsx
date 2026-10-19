import {
    Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, MenuItem, TextField,
} from '@mui/material'
import { useState } from 'react'

/**
 * Formulario para crear o editar una unidad (impresora física).
 * - `unidad` null/undefined -> crear (nombre por defecto = modelo)
 * - `unidad` objeto         -> editar
 */
function UnidadDialog({ abierto, onCerrar, modelo, unidad, oficinas, setUnidades }) {

    const editando = Boolean(unidad)

    const [nombre, setNombre] = useState(unidad?.nombre || modelo?.modelo || '')
    const [oficinaId, setOficinaId] = useState(unidad?.oficina_id ?? '')
    const [ip, setIp] = useState(unidad?.ip || '')
    const [estado, setEstado] = useState(unidad?.estado || 'activa')
    const [error, setError] = useState('')

    function guardar() {
        if (!nombre.trim() || !oficinaId) {
            setError('Completá el nombre y la oficina.')
            return
        }

        if (editando) {
            setUnidades((prev) => prev.map((u) => (
                u.id === unidad.id
                    ? {
                        ...u,
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
                modelo_id: modelo.id,
                nombre: nombre.trim(),
                oficina_id: Number(oficinaId),
                ip: ip.trim(),
                estado,
            }])
        }

        onCerrar()
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>
                {editando ? 'Editar unidad' : 'Nueva unidad'} · {modelo?.marca} {modelo?.modelo}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 320 }}>
                    {error && <Alert severity="error">{error}</Alert>}

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
