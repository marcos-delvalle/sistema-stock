import {
    Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, FormControlLabel, Switch, TextField,
} from '@mui/material'
import { useState } from 'react'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'

/**
 * Dialog reutilizable para crear y editar artículos (incluidos tóneres).
 *
 * - Si `articulo` viene null  -> modo CREAR
 * - Si `articulo` viene objeto -> modo EDITAR (permite dar de baja y cambiar estado)
 * - Si `categoriaIdFija` viene definida, el select de categoría se oculta
 */
function ArticuloDialog({ abierto, onCerrar, categorias, articulo, categoriaIdFija }) {
    const { recargar, notificar } = useDatos()
    const editando = Boolean(articulo)

    const [nombre, setNombre] = useState(articulo?.nombre || '')
    const [categoriaId, setCategoriaId] = useState(articulo?.categoria_id ?? categoriaIdFija ?? '')
    const [stockMinimo, setStockMinimo] = useState(articulo?.stock_minimo ?? 3)
    const [stockInicial, setStockInicial] = useState(0)
    const [activo, setActivo] = useState(articulo?.activo ?? true)
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    async function guardar() {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }

        const catId = Number(categoriaId)

        if (!catId) {
            setError('Elegí una categoría')
            return
        }

        setGuardando(true)
        setError('')

        try {
            if (editando) {
                await api.put(`/articulos/${articulo.id}`, {
                    nombre: nombre.trim(),
                    categoria_id: catId,
                    stock_minimo: Number(stockMinimo),
                })

                if (activo !== articulo.activo) {
                    await api.patch(`/articulos/${articulo.id}/activo`, { activo })
                }

                notificar('Artículo actualizado')
            } else {
                await api.post('/articulos', {
                    nombre: nombre.trim(),
                    categoria_id: catId,
                    stock_actual: Number(stockInicial),
                    stock_minimo: Number(stockMinimo),
                })

                notificar('Artículo creado')
            }

            await recargar()
            onCerrar()
        } catch (e) {
            setError(e.message)
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar() {
        const confirmado = window.confirm(
            `¿Dar de baja "${articulo.nombre}"? El artículo quedará inactivo y se desasignará de los modelos compatibles.`
        )

        if (!confirmado) return

        setGuardando(true)
        setError('')

        try {
            await api.delete(`/articulos/${articulo.id}`)
            notificar('Artículo dado de baja')
            await recargar()
            onCerrar()
        } catch (e) {
            setError(e.message)
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={guardando ? undefined : onCerrar}>
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
                            onChange={(e, nueva) => { setCategoriaId(nueva ? nueva.id : ''); setError('') }}
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
                            helperText="Si es mayor a 0, se registra una entrada automática en el historial."
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
                {editando && articulo.activo ? (
                    <Button color="error" onClick={eliminar} disabled={guardando}>
                        Dar de baja
                    </Button>
                ) : (
                    <span />
                )}
                <Box>
                    <Button onClick={onCerrar} disabled={guardando}>Cancelar</Button>
                    <Button variant="contained" onClick={guardar} disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    )
}

export default ArticuloDialog
