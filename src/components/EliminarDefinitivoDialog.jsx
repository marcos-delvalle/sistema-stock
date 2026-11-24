import {
    Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControlLabel, Typography,
} from '@mui/material'
import { useState } from 'react'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'

/**
 * Baja definitiva de un artículo inactivo. Borra también todo su historial de
 * movimientos. Es irreversible, por eso exige una confirmación explícita.
 */
function EliminarDefinitivoDialog({ abierto, onCerrar, articulo }) {
    const { movimientos, recargar, notificar } = useDatos()

    const [entendido, setEntendido] = useState(false)
    const [error, setError] = useState('')
    const [eliminando, setEliminando] = useState(false)

    const propios = movimientos.filter((m) => m.articulo_id === articulo?.id)
    const cantidadMovimientos = propios.length
    const cantidadFallas = propios.filter((m) => m.reporta_falla).length

    async function eliminar() {
        if (!articulo) return

        setEliminando(true)
        setError('')

        try {
            await api.delete(`/articulos/${articulo.id}/definitivo`)
            notificar('Artículo eliminado definitivamente')
            await recargar()
            onCerrar()
        } catch (e) {
            setError(e.message)
        } finally {
            setEliminando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={eliminando ? undefined : onCerrar} maxWidth="xs" fullWidth>
            <DialogTitle>Eliminar definitivamente</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <Alert severity="error">
                        Se eliminará permanentemente «{articulo?.nombre}».
                        {' '}Esta acción no se puede deshacer.
                    </Alert>

                    <Typography variant="body2" color="text.secondary">
                        {cantidadMovimientos === 0
                            ? 'El artículo no tiene movimientos registrados.'
                            : `También se eliminarán ${cantidadMovimientos} movimiento${cantidadMovimientos === 1 ? '' : 's'} del historial.`}
                        {cantidadFallas > 0 && (
                            <> Incluye {cantidadFallas} reporte{cantidadFallas === 1 ? '' : 's'} de tóner fallado.</>
                        )}
                    </Typography>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={entendido}
                                onChange={(e) => setEntendido(e.target.checked)}
                            />
                        }
                        label="Entiendo que se eliminarán todos los movimientos"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar} disabled={eliminando}>Cancelar</Button>
                <Button
                    color="error"
                    variant="contained"
                    onClick={eliminar}
                    disabled={eliminando || !entendido}
                >
                    {eliminando ? 'Eliminando...' : 'Eliminar definitivamente'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EliminarDefinitivoDialog
