import {
    Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField,
} from '@mui/material'
import { useState } from 'react'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'
import { normalizar } from '../utils/texto'

function CrearImpresoraDialog({
    abierto, onCerrar, articulos, modelos, categorias, modelo,
}) {
    const { recargar, notificar } = useDatos()
    const editando = Boolean(modelo)

    const [marca, setMarca] = useState(modelo?.marca || '')
    const [nombreModelo, setNombreModelo] = useState(modelo?.modelo || '')
    const [tonerId, setTonerId] = useState(modelo?.articulo_id ?? '')
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    const catToner = categorias.find((c) => c.nombre === 'Tóner')
    const toners = articulos.filter((a) => (
        a.categoria_id === catToner?.id && (a.activo || a.id === modelo?.articulo_id)
    ))
    const tonerSeleccionado = toners.find((t) => t.id === Number(tonerId)) || null

    // Valores ya cargados, sin repetir. Sirven como sugerencias al escribir.
    const marcasExistentes = [...new Set(modelos.map((m) => m.marca))]
    const modelosExistentes = [...new Set(
        modelos
            .filter((m) => !marca || m.marca.toLowerCase() === marca.trim().toLowerCase())
            .map((m) => m.modelo)
    )]

    function limpiar() {
        setMarca(modelo?.marca || '')
        setNombreModelo(modelo?.modelo || '')
        setTonerId(modelo?.articulo_id ?? '')
        setError('')
    }

    function cerrar() {
        limpiar()
        onCerrar()
    }

    async function guardar() {
        if (!marca.trim() || !nombreModelo.trim()) {
            setError('Completá marca y modelo.')
            return
        }

        if (!editando && !tonerId) {
            setError('Elegí un tóner compatible.')
            return
        }

        const existe = modelos.some((m) =>
            m.id !== modelo?.id &&
            normalizar(m.marca) === normalizar(marca) &&
            normalizar(m.modelo) === normalizar(nombreModelo)
        )

        if (existe) {
            setError('Ya existe una impresora con esa marca y modelo.')
            return
        }

        setGuardando(true)
        setError('')

        try {
            const datos = {
                marca: marca.trim(),
                modelo: nombreModelo.trim(),
                articulo_id: tonerId ? Number(tonerId) : null,
            }

            if (editando) {
                await api.put(`/modelos/${modelo.id}`, datos)
                notificar('Impresora actualizada')
            } else {
                await api.post('/modelos', datos)
                notificar('Modelo de impresora creado')
            }

            await recargar()
            cerrar()
        } catch (e) {
            setError(e.message)
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={guardando ? undefined : cerrar} maxWidth="xs" fullWidth>
            <DialogTitle>{editando ? 'Editar impresora' : 'Nueva impresora'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <Autocomplete
                        freeSolo
                        options={marcasExistentes}
                        inputValue={marca}
                        onInputChange={(e, valor) => { setMarca(valor); setError('') }}
                        onChange={(e, valor) => { setMarca(valor || ''); setError('') }}
                        renderInput={(params) => <TextField {...params} label="Marca" />}
                    />

                    <Autocomplete
                        freeSolo
                        options={modelosExistentes}
                        inputValue={nombreModelo}
                        onInputChange={(e, valor) => { setNombreModelo(valor); setError('') }}
                        onChange={(e, valor) => { setNombreModelo(valor || ''); setError('') }}
                        renderInput={(params) => <TextField {...params} label="Modelo" />}
                    />

                    <Autocomplete
                        options={toners}
                        getOptionLabel={(t) => t.nombre}
                        value={tonerSeleccionado}
                        onChange={(e, nuevo) => { setTonerId(nuevo ? nuevo.id : ''); setError('') }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={editando ? 'Tóner compatible (opcional)' : 'Tóner compatible'}
                            />
                        )}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={cerrar} disabled={guardando}>Cancelar</Button>
                <Button variant="contained" onClick={guardar} disabled={guardando}>
                    {guardando
                        ? (editando ? 'Guardando...' : 'Creando...')
                        : (editando ? 'Guardar cambios' : 'Crear')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CrearImpresoraDialog
