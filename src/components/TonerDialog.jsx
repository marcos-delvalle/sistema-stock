import {
    Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, FormControlLabel, Switch, TextField, Typography,
} from '@mui/material'
import { useState } from 'react'

/**
 * Diálogo de tóner: Nombre, stock mínimo y modelos de impresora compatibles.
 *
 * La compatibilidad vive en `modelos.articulo_id` (un tóner por modelo).
 * Si elegís un modelo que ya estaba en otro tóner, al guardar se lo "mueve"
 * a este. Si deseleccionás uno, queda sin tóner.
 */
function TonerDialog({
    abierto, onCerrar, toner, categoriaId, articulos, modelos,
    setArticulos, setModelos,
}) {
    const editando = Boolean(toner)

    const [nombre, setNombre] = useState(toner?.nombre || '')
    const [stockMinimo, setStockMinimo] = useState(toner?.stock_minimo ?? 3)
    const [stockInicial, setStockInicial] = useState(0)
    const [activo, setActivo] = useState(toner?.activo ?? true)
    const [seleccionados, setSeleccionados] = useState(
        editando ? modelos.filter((m) => m.articulo_id === toner.id).map((m) => m.id) : []
    )
    const [error, setError] = useState('')

    function guardar() {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }

        const idFinal = editando ? toner.id : Date.now()
        const datos = {
            nombre: nombre.trim(),
            categoria_id: categoriaId,
            stock_minimo: Number(stockMinimo),
            activo,
        }

        if (editando) {
            setArticulos((prev) => prev.map((a) => (
                a.id === toner.id ? { ...a, ...datos } : a
            )))
        } else {
            setArticulos((prev) => [...prev, {
                id: idFinal,
                ...datos,
                stock_actual: Number(stockInicial),
            }])
        }

        // Aplicamos las compatibilidades sobre los modelos
        setModelos((prev) => prev.map((m) => {
            const marcado = seleccionados.includes(m.id)

            if (marcado) {
                return m.articulo_id === idFinal ? m : { ...m, articulo_id: idFinal }
            }
            return m.articulo_id === idFinal ? { ...m, articulo_id: null } : m
        }))

        onCerrar()
    }

    function eliminar() {
        const ok = window.confirm(
            `¿Eliminar "${toner.nombre}"? Las impresoras compatibles quedarán sin tóner asignado.`
        )
        if (!ok) return

        setArticulos((prev) => prev.filter((a) => a.id !== toner.id))
        setModelos((prev) => prev.map((m) => (
            m.articulo_id === toner.id ? { ...m, articulo_id: null } : m
        )))
        onCerrar()
    }

    return (
        <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
            <DialogTitle>{editando ? 'Editar tóner' : 'Nuevo tóner'}</DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => { setNombre(e.target.value); setError('') }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Stock mínimo"
                            type="number"
                            value={stockMinimo}
                            onChange={(e) => {
                                const v = Number(e.target.value)
                                setStockMinimo(v < 0 ? 0 : v)
                            }}
                            sx={{ flex: 1 }}
                        />

                        {!editando && (
                            <TextField
                                label="Stock inicial"
                                type="number"
                                value={stockInicial}
                                onChange={(e) => {
                                    const v = Number(e.target.value)
                                    setStockInicial(v < 0 ? 0 : v)
                                }}
                                sx={{ flex: 1 }}
                            />
                        )}
                    </Box>

                    <Autocomplete
                        multiple
                        options={modelos}
                        getOptionLabel={(m) => `${m.marca} ${m.modelo}`}
                        value={modelos.filter((m) => seleccionados.includes(m.id))}
                        onChange={(e, nuevos) => setSeleccionados(nuevos.map((m) => m.id))}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Impresoras compatibles"
                                placeholder="Buscar marca o modelo"
                            />
                        )}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props
                            const otroToner = articulos.find((a) => a.id === option.articulo_id)

                            return (
                                <Box component="li" key={key} {...optionProps}>
                                    <Box>
                                        <Typography variant="body2">
                                            {option.marca} {option.modelo}
                                        </Typography>
                                        {otroToner && otroToner.id !== toner?.id && (
                                            <Typography variant="caption" color="text.secondary">
                                                Ya asignada a {otroToner.nombre} — se moverá a este tóner
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            )
                        }}
                        noOptionsText="No hay modelos de impresora cargados"
                    />

                    <Typography variant="caption" color="text.secondary">
                        Podés elegir varios modelos. Si uno ya pertenece a otro tóner, se mueve a este al guardar.
                    </Typography>

                    {editando && (
                        <>
                            <Divider />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={activo}
                                        onChange={(e) => setActivo(e.target.checked)}
                                    />
                                }
                                label={activo ? 'Activo' : 'Inactivo'}
                            />
                        </>
                    )}
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

export default TonerDialog
