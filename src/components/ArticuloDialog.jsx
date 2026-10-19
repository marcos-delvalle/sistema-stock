import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    Autocomplete,
    Alert,
    FormControlLabel,
    Switch,
    Divider,
} from '@mui/material'
import { useState } from 'react'

/**
 * Dialog reutilizable para crear y editar artículos (incluidos tóneres).
 *
 * - Si `articulo` viene null  -> modo CREAR
 * - Si `articulo` viene objeto -> modo EDITAR (permite eliminar y cambiar estado)
 * - Si `categoriaIdFija` viene definida, el select de categoría se oculta
 */
function ArticuloDialog({ abierto, onCerrar, categorias, articulo, categoriaIdFija, setArticulos }) {
    const editando = Boolean(articulo)

    const [nombre, setNombre] = useState(articulo?.nombre || '')
    const [categoriaId, setCategoriaId] = useState(articulo?.categoria_id ?? categoriaIdFija ?? '')
    const [stockMinimo, setStockMinimo] = useState(articulo?.stock_minimo ?? 3)
    const [stockInicial, setStockInicial] = useState(0)
    const [activo, setActivo] = useState(articulo?.activo ?? true)
    const [error, setError] = useState('')

    function guardar() {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }

        if (editando) {
            setArticulos((prev) => prev.map((a) => (
                a.id === articulo.id
                    ? {
                        ...a,
                        nombre,
                        categoria_id: Number(categoriaId),
                        stock_minimo: Number(stockMinimo),
                        activo,
                    }
                    : a
            )))
        } else {
            const nuevo = {
                id: Date.now(),
                nombre,
                categoria_id: Number(categoriaId),
                stock_actual: Number(stockInicial),
                stock_minimo: Number(stockMinimo),
                activo: true,
            }
            setArticulos((prev) => [...prev, nuevo])
        }

        onCerrar()
    }

    function eliminar() {
        const ok = window.confirm(`¿Eliminar "${articulo.nombre}"? Esta acción no se puede deshacer.`)
        if (!ok) return
        setArticulos((prev) => prev.filter((a) => a.id !== articulo.id))
        onCerrar()
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar artículo' : 'Nuevo artículo'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 320 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => { setNombre(e.target.value); setError('') }}
                    />

                    {categoriaIdFija === undefined && (
                        <Autocomplete
                            options={categorias}
                            getOptionLabel={(c) => c.nombre}
                            value={categorias.find((c) => c.id === Number(categoriaId)) || null}
                            onChange={(e, nueva) => setCategoriaId(nueva ? nueva.id : '')}
                            renderInput={(params) => <TextField {...params} label="Categoría" />}
                        />
                    )}

                    <TextField
                        label="Stock mínimo"
                        type="number"
                        value={stockMinimo}
                        onChange={(e) => {
                            const v = Number(e.target.value)
                            setStockMinimo(v < 0 ? 0 : v)
                        }}
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
                        />
                    )}

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

export default ArticuloDialog