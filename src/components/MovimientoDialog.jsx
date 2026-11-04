import {
    Alert, Autocomplete, Box, Button, Checkbox, Dialog, DialogActions,
    DialogContent, DialogTitle, FormControlLabel, MenuItem, TextField, Typography,
} from '@mui/material'
import { useState } from 'react'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'
import { normalizar } from '../utils/texto'

// Mantiene una sola opción por etiqueta. Si se está editando, conserva el
// registro actual aunque su etiqueta coincida con la de otro.
function sinDuplicados(items, etiqueta, conservarId = null) {
    const porEtiqueta = new Map()

    for (const item of items) {
        const clave = normalizar(etiqueta(item))

        if (!porEtiqueta.has(clave) || item.id === conservarId) {
            porEtiqueta.set(clave, item)
        }
    }

    return [...porEtiqueta.values()]
}

function conContexto(nombre, contexto) {
    return contexto ? `${nombre} — ${contexto}` : nombre
}

function MovimientoDialog({
    abierto, onCerrar, articulos, oficinas, categorias = [], dependencias = [],
    movimiento,
}) {
    const { recargar, notificar } = useDatos()
    const editando = Boolean(movimiento)

    const [articuloId, setArticuloId] = useState(movimiento?.articulo_id ?? '')
    const [tipo, setTipo] = useState(movimiento?.tipo || 'salida')
    const [fecha, setFecha] = useState(() => (
        movimiento ? dayjs(movimiento.fecha) : dayjs()
    ))
    const [cantidad, setCantidad] = useState(movimiento?.cantidad ?? 1)
    const [afectaStock, setAfectaStock] = useState(movimiento?.afecta_stock ?? true)
    const [oficinaId, setOficinaId] = useState(movimiento?.oficina_id ?? '')
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    const etiquetaArticulo = (a) => conContexto(
        a.nombre,
        categorias.find((c) => c.id === a.categoria_id)?.nombre
    )
    const etiquetaOficina = (o) => conContexto(
        o.nombre,
        dependencias.find((d) => d.id === o.dependencia_id)?.nombre
    )

    const articulosUnicos = sinDuplicados(
        articulos,
        etiquetaArticulo,
        movimiento?.articulo_id ?? null
    )
    const oficinasUnicas = sinDuplicados(
        oficinas,
        etiquetaOficina,
        movimiento?.oficina_id ?? null
    )

    const articulo = articulosUnicos.find((a) => a.id === Number(articuloId))

    // Si se edita un movimiento que afecta stock, el stock actual todavía
    // incluye su efecto. Este es el stock que quedaría disponible al revertirlo.
    const stockDisponible = (() => {
        if (!articulo) return 0
        if (
            !editando ||
            !movimiento.afecta_stock ||
            movimiento.articulo_id !== articulo.id
        ) {
            return articulo.stock_actual
        }

        return articulo.stock_actual + (
            movimiento.tipo === 'entrada'
                ? -movimiento.cantidad
                : movimiento.cantidad
        )
    })()

    async function guardar() {
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
        if (tipo === 'salida' && afectaStock && cant > stockDisponible) {
            const stockFinal = stockDisponible - cant

            setError(
                `Stock insuficiente: el artículo quedaría con ${stockFinal} ` +
                `unidad${stockFinal === -1 ? '' : 'es'}.`
            )
            return
        }

        setGuardando(true)
        setError('')

        try {
            const datos = {
                articulo_id: articulo.id,
                tipo,
                cantidad: cant,
                oficina_id: tipo === 'salida' ? Number(oficinaId) : null,
                fecha: fecha.format('YYYY-MM-DD'),
                afecta_stock: afectaStock,
            }

            if (editando) {
                await api.put(`/movimientos/${movimiento.id}`, datos)
                notificar('Movimiento actualizado')
            } else {
                await api.post('/movimientos', datos)

                const mensaje = tipo === 'entrada' ? 'Entrada registrada' : 'Salida registrada'
                notificar(afectaStock ? mensaje : `${mensaje} sin modificar stock`)
            }

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
            <DialogTitle>{editando ? 'Editar movimiento' : 'Nuevo movimiento'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <Autocomplete
                        options={articulosUnicos}
                        getOptionLabel={etiquetaArticulo}
                        value={articulosUnicos.find((a) => a.id === Number(articuloId)) || null}
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
                                        ? stockDisponible !== articulo.stock_actual
                                            ? `Stock actual: ${articulo.stock_actual} · disponible al editar: ${stockDisponible}`
                                            : `Stock actual: ${articulo.stock_actual}`
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
                            options={oficinasUnicas}
                            getOptionLabel={etiquetaOficina}
                            value={oficinasUnicas.find((o) => o.id === Number(oficinaId)) || null}
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
                <Button variant="contained" onClick={guardar} disabled={guardando}>
                    {guardando
                        ? (editando ? 'Guardando...' : 'Registrando...')
                        : (editando ? 'Guardar cambios' : 'Registrar')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default MovimientoDialog
