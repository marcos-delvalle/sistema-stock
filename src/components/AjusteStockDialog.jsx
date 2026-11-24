import {
    Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField, Typography,
} from '@mui/material'
import { useState } from 'react'
import { api } from '../api/client'
import { useDatos } from '../context/DatosContext'

/**
 * Ajuste manual de stock. No genera una entrada ni una salida: actualiza el
 * stock y deja un registro de tipo "Ajuste" en el historial con el motivo.
 */
function AjusteStockDialog({ abierto, onCerrar, articulo }) {
    const { recargar, notificar } = useDatos()

    const stockActual = articulo?.stock_actual ?? 0
    const [stockNuevo, setStockNuevo] = useState(String(stockActual))
    const [motivo, setMotivo] = useState('')
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    const stockNumero = Number(stockNuevo)
    const stockValido = stockNuevo !== ''
        && Number.isInteger(stockNumero)
        && stockNumero >= 0
    const diferencia = stockValido ? stockNumero - stockActual : 0

    async function guardar() {
        if (!articulo) return

        if (!stockValido) {
            setError('Ingresá un stock entero mayor o igual a 0.')
            return
        }

        if (diferencia === 0) {
            setError('El stock nuevo debe ser distinto del stock actual.')
            return
        }

        if (!motivo.trim()) {
            setError('Indicá el motivo del ajuste.')
            return
        }

        setGuardando(true)
        setError('')

        try {
            await api.patch(`/articulos/${articulo.id}/stock`, {
                stock_nuevo: stockNumero,
                motivo: motivo.trim(),
            })

            notificar('Stock ajustado')
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
            <DialogTitle>Ajustar stock</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {articulo?.nombre}
                        </Typography>
                        <Chip size="small" label={`Stock actual: ${stockActual}`} />
                    </Box>

                    <TextField
                        label="Stock nuevo"
                        type="number"
                        value={stockNuevo}
                        onChange={(e) => { setStockNuevo(e.target.value); setError('') }}
                        helperText={
                            !stockValido
                                ? 'Ingresá un número entero mayor o igual a 0.'
                                : diferencia === 0
                                    ? 'El stock nuevo debe ser distinto del actual.'
                                    : ' '
                        }
                        slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    />

                    <Typography
                        variant="body2"
                        color={
                            diferencia > 0
                                ? 'success.main'
                                : diferencia < 0
                                    ? 'error.main'
                                    : 'text.secondary'
                        }
                    >
                        {diferencia > 0
                            ? `Se sumarán ${diferencia} unidad${diferencia === 1 ? '' : 'es'}.`
                            : diferencia < 0
                                ? `Se restarán ${Math.abs(diferencia)} unidad${Math.abs(diferencia) === 1 ? '' : 'es'}.`
                                : 'Sin cambios.'}
                    </Typography>

                    <TextField
                        label="Motivo"
                        value={motivo}
                        onChange={(e) => { setMotivo(e.target.value); setError('') }}
                        multiline
                        minRows={2}
                        slotProps={{ htmlInput: { maxLength: 200 } }}
                        helperText="Obligatorio. Queda guardado en el historial."
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar} disabled={guardando}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={guardar}
                    disabled={guardando || !stockValido || diferencia === 0 || !motivo.trim()}
                >
                    {guardando ? 'Guardando...' : 'Guardar ajuste'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AjusteStockDialog
