import {Card, CardContent, Box, Chip, Typography} from '@mui/material'

function Toners({articulos, modelos, unidades}) {

    const toners = articulos.filter((a) => a.categoria_id === 1)
    
    return (
        <>
        {toners.map((t) => {
            const modelosCompatibles = modelos.filter((m) => m.articulo_id === t.id)
    
            const compatibles = modelosCompatibles
                .map((m) => `${m.marca} ${m.modelo}`)
                .join(', ')
    
            const instaladas = unidades.filter((u) => 
                modelosCompatibles.some((m) => m.id === u.modelo_id)
            ).length
        
            return (
                <Card key={t.id} sx={{minWidth: 250}}>
                    <CardContent>
                        <Typography variant='h6'>{t.nombre}</Typography>
                        <Typography>Stock: {t.stock_actual} (min {t.stock_minimo})</Typography>
                        <Typography variant='body2'>Impresoras compatibles: {compatibles || "Ninguna"}</Typography>
                        <Typography>Unidades instalas {instaladas}</Typography>
                    </CardContent>
                </Card>
            )
        })}
        </>
 )
}
export default Toners