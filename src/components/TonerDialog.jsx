import {
    Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, FormControlLabel, Switch, TextField, Typography,
} from '@mui/material'
import { useState } from 'react'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'

/**
 * Diálogo de tóner: Nombre, stock mínimo y modelos de impresora compatibles.
 *
 * La compatibilidad vive en `modelos.articulo_id` (un tóner por modelo).
 * Si elegís un modelo que ya estaba en otro tóner, al guardar se lo "mueve"
 * a este. Si deseleccionás uno, queda sin tóner.
 */
function TonerDialog({
    abierto, onCerrar, toner, categoriaId, articulos, modelos,
}) {
    const { recargar, notificar } = useDatos()
    const editando = Boolean(toner)

    const [nombre, setNombre] = useState(toner?.nombre || '')
    const [stockMinimo, setStockMinimo] = useState(toner?.stock_minimo ?? 3)
    const [stockInicial, setStockInicial] = useState(0)
    const [activo, setActivo] = useState(toner?.activo ?? true)
    const [seleccionados, setSeleccionados] = useState(
        editando ? modelos.filter((m) => m.articulo_id === toner.id).map((m) => m.id) : []
    )
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    async function guardar() {
        if (!nombre.trim()) {
            setError('El nombre es obligatorio')
            return
        }

        if (!categoriaId) {
            setError('No se encontró la categoría Tóner. Recargá la página.')
            return
        }

        setGuardando(true)
        setError('')

        try {
            let idFinal = toner?.id

            if (editando) {
                await api.put(`/articulos/${idFinal}`, {
                    nombre: nombre.trim(),
                    categoria_id: categoriaId,
                    stock_minimo: Number(stockMinimo),
                })

                if (activo !== toner.activo) {
                    await api.patch(`/articulos/${idFinal}/activo`, { activo })
                }
            } else {
                const creado = await api.post('/articulos', {
                    nombre: nombre.trim(),
                    categoria_id: categoriaId,
                    stock_actual: Number(stockInicial),
                    stock_minimo: Number(stockMinimo),
                })

                idFinal = creado.id
            }

            const cambios = modelos.filter((m) => {
                const marcado = seleccionados.includes(m.id)
                const eraDeEsteToner = m.articulo_id === idFinal

                return (marcado && !eraDeEsteToner) || (!marcado && eraDeEsteToner)
            })

            await Promise.all(cambios.map((m) => api.put(`/modelos/${m.id}/compatibilidad`, {
                articulo_id: seleccionados.includes(m.id) ? idFinal : null,
            })))

            notificar(editando ? 'Tóner actualizado' : 'Tóner creado')
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
            `¿Dar de baja "${toner.nombre}"? Las impresoras compatibles quedarán sin tóner asignado.`
        )

        if (!confirmado) return

        setGuardando(true)
        setError('')

        try {
            await api.delete(`/articulos/${toner.id}`)
            notificar('Tóner dado de baja')
            await recargar()
            onCerrar()
        } catch (e) {
            setError(e.message)
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="sm" fullWidth>
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
                {editando && toner.activo ? (
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

export default TonerDialog
