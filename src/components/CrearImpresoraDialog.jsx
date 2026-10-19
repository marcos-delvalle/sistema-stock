import {
    Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField,
} from '@mui/material'
import { useState } from 'react'

function CrearImpresoraDialog({ abierto, onCerrar, articulos, modelos, setModelos, categorias }) {

    const [marca, setMarca] = useState('')
    const [nombreModelo, setNombreModelo] = useState('')
    const [tonerId, setTonerId] = useState('')
    const [error, setError] = useState('')

    const catToner = categorias.find((c) => c.nombre === 'Tóner')
    const toners = articulos.filter((a) => a.categoria_id === catToner?.id && a.activo)
    const tonerSeleccionado = toners.find((t) => t.id === Number(tonerId)) || null

    // Valores ya cargados, sin repetir. Sirven como sugerencias al escribir.
    const marcasExistentes = [...new Set(modelos.map((m) => m.marca))]
    const modelosExistentes = [...new Set(
        modelos
            .filter((m) => !marca || m.marca.toLowerCase() === marca.trim().toLowerCase())
            .map((m) => m.modelo)
    )]

    function limpiar() {
        setMarca('')
        setNombreModelo('')
        setTonerId('')
        setError('')
    }

    function cerrar() {
        limpiar()
        onCerrar()
    }

    function crear() {
        if (!marca.trim() || !nombreModelo.trim() || !tonerId) {
            setError('Completá marca, modelo y tóner compatible.')
            return
        }

        const existe = modelos.some((m) =>
            m.marca.toLowerCase() === marca.trim().toLowerCase() &&
            m.modelo.toLowerCase() === nombreModelo.trim().toLowerCase()
        )
        if (existe) {
            setError('Ya existe un modelo con esa marca y modelo.')
            return
        }

        setModelos((prev) => [...prev, {
            id: Date.now(),
            marca: marca.trim(),
            modelo: nombreModelo.trim(),
            articulo_id: Number(tonerId),
        }])

        cerrar()
    }

    return (
        <Dialog open={abierto} onClose={cerrar}>
            <DialogTitle>Nueva impresora</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 320 }}>
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
                        renderInput={(params) => <TextField {...params} label="Tóner compatible" />}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={cerrar}>Cancelar</Button>
                <Button variant="contained" onClick={crear}>Crear</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CrearImpresoraDialog
