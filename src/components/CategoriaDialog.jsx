import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, IconButton, List, ListItem, ListItemText, TextField, Tooltip,
    Typography,
} from '@mui/material'
import { Add, Check, Close, Delete, Edit } from '@mui/icons-material'
import { useState } from 'react'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'

/**
 * Alta, edición y eliminación de categorías de artículos.
 * Una categoría con artículos asociados no se puede eliminar (409).
 */
function CategoriaDialog({ abierto, onCerrar, categorias, articulos }) {
    const { recargar, notificar } = useDatos()

    const [nombreNuevo, setNombreNuevo] = useState('')
    const [editandoId, setEditandoId] = useState(null)
    const [nombreEdicion, setNombreEdicion] = useState('')
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    function contarArticulos(categoriaId) {
        return articulos.filter((a) => a.categoria_id === categoriaId).length
    }

    function yaExiste(nombre, exceptoId = null) {
        const buscado = nombre.trim().toLowerCase()

        return categorias.some((c) => (
            c.id !== exceptoId && c.nombre.toLowerCase() === buscado
        ))
    }

    function cerrar() {
        setNombreNuevo('')
        setEditandoId(null)
        setError('')
        onCerrar()
    }

    function empezarEdicion(categoria) {
        setEditandoId(categoria.id)
        setNombreEdicion(categoria.nombre)
        setError('')
    }

    function cancelarEdicion() {
        setEditandoId(null)
        setNombreEdicion('')
        setError('')
    }

    async function crear() {
        const nombre = nombreNuevo.trim()

        if (!nombre) {
            setError('Escribí el nombre de la categoría.')
            return
        }

        if (yaExiste(nombre)) {
            setError('Ya existe una categoría con ese nombre.')
            return
        }

        setGuardando(true)
        setError('')

        try {
            await api.post('/categorias', { nombre })
            setNombreNuevo('')
            notificar('Categoría creada')
            await recargar()
        } catch (e) {
            setError(e.message)
        } finally {
            setGuardando(false)
        }
    }

    async function guardarEdicion() {
        const nombre = nombreEdicion.trim()

        if (!nombre) {
            setError('El nombre es obligatorio.')
            return
        }

        if (yaExiste(nombre, editandoId)) {
            setError('Ya existe otra categoría con ese nombre.')
            return
        }

        setGuardando(true)
        setError('')

        try {
            await api.put(`/categorias/${editandoId}`, { nombre })
            setEditandoId(null)
            setNombreEdicion('')
            notificar('Categoría actualizada')
            await recargar()
        } catch (e) {
            setError(e.message)
        } finally {
            setGuardando(false)
        }
    }

    async function eliminar(categoria) {
        const cantidad = contarArticulos(categoria.id)

        if (cantidad > 0) {
            setError(
                `No se puede eliminar "${categoria.nombre}": tiene ${cantidad} ` +
                `artículo${cantidad === 1 ? '' : 's'} asociado${cantidad === 1 ? '' : 's'}.`
            )
            return
        }

        if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return

        setGuardando(true)
        setError('')

        try {
            await api.delete(`/categorias/${categoria.id}`)
            notificar('Categoría eliminada')
            await recargar()
        } catch (e) {
            setError(e.message)
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog
            open={abierto}
            onClose={guardando ? undefined : cerrar}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Categorías de artículos</DialogTitle>

            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <TextField
                        label="Nueva categoría"
                        value={nombreNuevo}
                        onChange={(e) => { setNombreNuevo(e.target.value); setError('') }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                crear()
                            }
                        }}
                        size="small"
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={crear}
                        disabled={guardando}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Agregar
                    </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {categorias.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Todavía no hay categorías cargadas.
                    </Typography>
                ) : (
                    <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
                        {categorias.map((categoria) => {
                            const cantidad = contarArticulos(categoria.id)
                            const enEdicion = editandoId === categoria.id

                            return (
                                <ListItem
                                    key={categoria.id}
                                    divider
                                    secondaryAction={enEdicion ? (
                                        <Box>
                                            <IconButton
                                                edge="end"
                                                color="success"
                                                onClick={guardarEdicion}
                                                disabled={guardando}
                                                aria-label="Guardar categoría"
                                            >
                                                <Check />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                onClick={cancelarEdicion}
                                                disabled={guardando}
                                                aria-label="Cancelar edición"
                                            >
                                                <Close />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Tooltip title="Renombrar">
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => empezarEdicion(categoria)}
                                                    disabled={guardando}
                                                    aria-label="Renombrar categoría"
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip
                                                title={cantidad > 0
                                                    ? 'Tiene artículos asociados: no se puede eliminar'
                                                    : 'Eliminar'}
                                            >
                                                <span>
                                                    <IconButton
                                                        edge="end"
                                                        color="error"
                                                        onClick={() => eliminar(categoria)}
                                                        disabled={guardando || cantidad > 0}
                                                        aria-label="Eliminar categoría"
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Box>
                                    )}
                                >
                                    {enEdicion ? (
                                        <TextField
                                            value={nombreEdicion}
                                            onChange={(e) => { setNombreEdicion(e.target.value); setError('') }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    guardarEdicion()
                                                }
                                                if (e.key === 'Escape') cancelarEdicion()
                                            }}
                                            size="small"
                                            autoFocus
                                            fullWidth
                                            sx={{ mr: 12 }}
                                        />
                                    ) : (
                                        <ListItemText
                                            primary={categoria.nombre}
                                            secondary={`${cantidad} artículo${cantidad === 1 ? '' : 's'}`}
                                        />
                                    )}
                                </ListItem>
                            )
                        })}
                    </List>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={cerrar} disabled={guardando}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CategoriaDialog
