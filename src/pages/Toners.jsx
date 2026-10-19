import {
    Box, Button, Card, CardActions, CardContent, Chip, LinearProgress,
    Typography,
} from '@mui/material'
import { Edit, Print } from '@mui/icons-material'
import { useState } from 'react'
import TonerDialog from '../components/TonerDialog'

function Toners({ articulos, modelos, unidades, categorias, setArticulos, setModelos }) {

    const [tonerEditando, setTonerEditando] = useState(null)
    const [dialogoAbierto, setDialogoAbierto] = useState(false)
    const [versionDialogo, setVersionDialogo] = useState(0)

    // Buscamos el id de la categoría "Tóner" por nombre (no por número mágico)
    const catToner = categorias.find((c) => c.nombre === 'Tóner')
    const toners = articulos.filter((a) => a.categoria_id === catToner?.id)

    function abrirNuevo() {
        setTonerEditando(null)
        setVersionDialogo((v) => v + 1)
        setDialogoAbierto(true)
    }

    function abrirEdicion(t) {
        setTonerEditando(t)
        setVersionDialogo((v) => v + 1)
        setDialogoAbierto(true)
    }

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Tóners</Typography>
                <Button variant="contained" onClick={abrirNuevo}>Nuevo tóner</Button>
            </Box>

            <TonerDialog
                key={`${tonerEditando?.id ?? 'nuevo-toner'}-${versionDialogo}`}
                abierto={dialogoAbierto}
                onCerrar={() => setDialogoAbierto(false)}
                toner={tonerEditando}
                categoriaId={catToner?.id}
                articulos={articulos}
                modelos={modelos}
                setArticulos={setArticulos}
                setModelos={setModelos}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'stretch' }}>
                {toners.map((t) => {
                    const modelosCompatibles = modelos.filter((m) => m.articulo_id === t.id)

                    const instaladas = unidades.filter((u) =>
                        modelosCompatibles.some((m) => m.id === u.modelo_id)
                    ).length

                    const bajoStock = t.stock_actual < t.stock_minimo
                    const porcentaje = t.stock_minimo > 0
                        ? Math.min(100, Math.round((t.stock_actual / t.stock_minimo) * 100))
                        : 100

                    return (
                        <Card
                            key={t.id}
                            sx={{
                                width: { xs: '100%', sm: 340 },
                                display: 'flex',
                                flexDirection: 'column',
                                borderTop: '4px solid',
                                borderTopColor: !t.activo
                                    ? 'grey.400'
                                    : bajoStock ? 'error.main' : 'success.main',
                                opacity: t.activo ? 1 : 0.7,
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                    <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                                        {t.nombre}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={t.activo ? 'Activo' : 'Inactivo'}
                                        color={t.activo ? 'success' : 'default'}
                                        variant={t.activo ? 'filled' : 'outlined'}
                                    />
                                </Box>

                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography
                                            variant="h4"
                                            sx={{ fontWeight: 600, color: bajoStock ? 'error.main' : 'text.primary' }}
                                        >
                                            {t.stock_actual}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            / mín {t.stock_minimo}
                                        </Typography>
                                        {bajoStock && <Chip size="small" color="error" label="Bajo stock" />}
                                    </Box>

                                    <LinearProgress
                                        variant="determinate"
                                        value={porcentaje}
                                        color={bajoStock ? 'error' : 'success'}
                                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                    />
                                </Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 2, mb: 0.5, fontWeight: 600, letterSpacing: 0.4 }}
                                >
                                    IMPRESORAS COMPATIBLES
                                </Typography>

                                {modelosCompatibles.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Ninguna
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {modelosCompatibles.map((m) => (
                                            <Chip
                                                key={m.id}
                                                size="small"
                                                variant="outlined"
                                                icon={<Print fontSize="small" />}
                                                label={`${m.marca} ${m.modelo}`}
                                            />
                                        ))}
                                    </Box>
                                )}

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                                    Unidades instaladas: <strong>{instaladas}</strong>
                                </Typography>
                            </CardContent>

                            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                <Button size="small" startIcon={<Edit />} onClick={() => abrirEdicion(t)}>
                                    Editar
                                </Button>
                            </CardActions>
                        </Card>
                    )
                })}

                {toners.length === 0 && (
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                        Todavía no hay tóners cargados.
                    </Typography>
                )}
            </Box>
        </>
    )
}
export default Toners
