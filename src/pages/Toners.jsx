import { Card, CardContent, Box, Chip, Typography, Button, IconButton, Tooltip } from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useState } from 'react'
import ArticuloDialog from '../components/ArticuloDialog'

function Toners({ articulos, modelos, unidades, categorias, setArticulos }) {

    const [articuloEditando, setArticuloEditando] = useState(null)
    const [dialogoAbierto, setDialogoAbierto] = useState(false)

    // Buscamos el id de la categoría "Tóner" por nombre (no por número mágico)
    const catToner = categorias.find((c) => c.nombre === 'Tóner')
    const toners = articulos.filter((a) => a.categoria_id === catToner?.id)

    function abrirNuevo() {
        setArticuloEditando(null)
        setDialogoAbierto(true)
    }

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Tóners</Typography>
                <Button variant="contained" onClick={abrirNuevo}>Nuevo tóner</Button>
            </Box>

            <ArticuloDialog
                key={articuloEditando?.id ?? 'nuevo-toner'}
                abierto={dialogoAbierto}
                onCerrar={() => setDialogoAbierto(false)}
                categorias={categorias}
                articulo={articuloEditando}
                categoriaIdFija={catToner?.id}
                setArticulos={setArticulos}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {toners.map((t) => {
                    const modelosCompatibles = modelos.filter((m) => m.articulo_id === t.id)

                    const compatibles = modelosCompatibles
                        .map((m) => `${m.marca} ${m.modelo}`)
                        .join(', ')

                    const instaladas = unidades.filter((u) =>
                        modelosCompatibles.some((m) => m.id === u.modelo_id)
                    ).length

                    return (
                        <Card key={t.id} sx={{ minWidth: 250 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Typography variant="h6">{t.nombre}</Typography>
                                    <Tooltip title="Editar">
                                        <IconButton size="small" onClick={() => { setArticuloEditando(t); setDialogoAbierto(true) }}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <Typography sx={{ my: 1 }}>
                                    Stock:{' '}
                                    <Chip
                                        size="small"
                                        label={`${t.stock_actual} (mín ${t.stock_minimo})`}
                                        color={t.stock_actual < t.stock_minimo ? 'error' : 'success'}
                                    />
                                </Typography>

                                <Typography variant="body2">
                                    Impresoras compatibles: {compatibles || 'Ninguna'}
                                </Typography>
                                <Typography variant="body2">
                                    Unidades instaladas: {instaladas}
                                </Typography>
                            </CardContent>
                        </Card>
                    )
                })}
            </Box>
        </>
    )
}
export default Toners