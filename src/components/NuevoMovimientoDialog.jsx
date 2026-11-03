import {
    Alert, Autocomplete, Box, Button, Checkbox, Dialog, DialogActions,
    DialogContent, DialogTitle, FormControlLabel, MenuItem, TextField, Typography,
} from '@mui/material'
import { useState } from 'react'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'

function NuevoMovimientoDialog({ abierto, onCerrar, articulos, oficinas }) {
    const { recargar, notificar } = useDatos()

    const [articuloId, setArticuloId] = useState('')
    const [tipo, setTipo] = useState('salida')
    const [fecha, setFecha] = useState(() => dayjs())
    const [cantidad, setCantidad] = useState(1)
    const [afectaStock, setAfectaStock] = useState(true)
    const [oficinaId, setOficinaId] = useState('')
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    const articulo = articulos.find((a) => a.id === Number(articuloId))

    async function registrar() {
        const cant = Number(cantidad)

        if (!articulo) {
            setError('Elegí un artículo.')
            return
        }
        if (!fecha || !fecha.isValid()) {
            setError('Elegí una fecha válida.')
            return
        }
        if (!cant || cant <= 0) {
            setError('La cantidad debe ser mayor a 0.')
            return
        }
        if (tipo === 'salida' && !oficinaId) {
            setError('Elegí la oficina de destino.')
            return
        }
        if (tipo === 'salida' && afectaStock && cant > articulo.stock_actual) {
            setError(
                `Stock insuficiente: solo hay ${articulo.stock_actual} ` +
                `unidad${articulo.stock_actual === 1 ? '' : 'es'}.`
            )
            return
        }

        setGuardando(true)
        setError('')

        try {
            await api.post('/movimientos', {
                articulo_id: articulo.id,
                tipo,
                cantidad: cant,
                oficina_id: tipo === 'salida' ? Number(oficinaId) : null,
                fecha: fecha.format('YYYY-MM-DD'),
                afecta_stock: afectaStock,
            })

            const mensaje = tipo === 'entrada' ? 'Entrada registrada' : 'Salida registrada'
            notificar(afectaStock ? mensaje : `${mensaje} sin modificar stock`)
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
            <DialogTitle>Nuevo movimiento</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <Autocomplete
                        options={articulos}
                        getOptionLabel={(a) => a.nombre}
                        value={articulos.find((a) => a.id === Number(articuloId)) || null}
                        onChange={(e, nuevo) => { setArticuloId(nuevo ? nuevo.id : ''); setError('') }}
                        renderInput={(params) => <TextField {...params} label="Artículo" />}
                    />

                    <TextField
                        select
                        label="Tipo"
                        value={tipo}
                        onChange={(e) => {
                            const nuevo = e.target.value
                            setTipo(nuevo)
                            if (nuevo === 'entrada') setOficinaId('')
                            setError('')
                        }}
                    >
                        <MenuItem value="entrada">Entrada</MenuItem>
                        <MenuItem value="salida">Salida</MenuItem>
                    </TextField>

                    <DatePicker
                        label="Fecha"
                        value={fecha}
                        onChange={(nueva) => { setFecha(nueva); setError('') }}
                        format="DD/MM/YYYY"
                        slotProps={{ textField: { fullWidth: true } }}
                    />

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'flex-start' },
                            gap: 1.5,
                        }}
                    >
                        <TextField
                            label="Cantidad"
                            type="number"
                            value={cantidad}
                            onChange={(e) => {
                                const v = Number(e.target.value)
                                setCantidad(v < 1 ? 1 : v)
                                setError('')
                            }}
                            helperText={
                                !afectaStock
                                    ? 'No modifica el stock actual'
                                    : articulo
                                        ? `Stock actual: ${articulo.stock_actual}`
                                        : ' '
                            }
                            sx={{ flex: 1 }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={afectaStock}
                                    onChange={(e) => {
                                        setAfectaStock(e.target.checked)
                                        setError('')
                                    }}
                                />
                            }
                            label={tipo === 'entrada' ? 'Sumar stock' : 'Descontar'}
                            sx={{ mt: { xs: 0, sm: 1 }, mr: 0, whiteSpace: 'nowrap' }}
                        />
                    </Box>

                    {tipo === 'salida' ? (
                        <Autocomplete
                            options={oficinas}
                            getOptionLabel={(o) => o.nombre}
                            value={oficinas.find((o) => o.id === Number(oficinaId)) || null}
                            onChange={(e, nueva) => { setOficinaId(nueva ? nueva.id : ''); setError('') }}
                            renderInput={(params) => <TextField {...params} label="Oficina de destino" />}
                        />
                    ) : (
                        <Typography variant="caption" color="text.secondary">
                            Las entradas suman stock al depósito y no se asignan a una oficina.
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar} disabled={guardando}>Cancelar</Button>
                <Button variant="contained" onClick={registrar} disabled={guardando}>
                    {guardando ? 'Registrando...' : 'Registrar'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default NuevoMovimientoDialog
