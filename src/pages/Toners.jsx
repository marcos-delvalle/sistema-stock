import {Card, CardContent, Box, Paper, Chip, Typography} from '@mui/material'

function Toners({articulos, impresoras, compatibilidades}) {

    const toners = articulos.filter((a) => a.categoria_id === 1)
    
    return (
        <>
        <h1>Toners</h1>
        <Box sx={{display:'flex', flexWrap:'wrap', gap:2}}>
            {toners.map((t) => {
                const compatibles = compatibilidades
                .filter((c) => c.articulo_id === t.id)
                .map((c) => impresoras.find((i) => i.id === c.impresora_id)?.modelo)
                .join(', ')
            return (
                <Card key={t.id} sx={{minWidth: 250}}>
                    <CardContent>
                        <Typography variant='h6'>{t.nombre}</Typography>
                        <Typography>Stock: {t.stock_actual} (min {t.stock_minimo})</Typography>
                        <Typography variant='body2'>Compatible con: {compatibles || "Ninguna"}</Typography>
                    </CardContent>
                </Card>
            )
        })}
        </Box>
        </>
 )
}
export default Toners
{/* {compatibilidades
    .filter((c) => c.articulo_id === t.id)
    .map((c) => impresoras.find((i) => i.id === c.impresora_id)?.modelo)
    .join(', ')
}
<Card>
    <CardContent>
        <Typography variant="h6">{t.nombre}</Typography>
        <Typography>Stock: {t.stock_actual} (min{t.stock_minimo})</Typography>
        <Typography variant="body2">Compatible con: {compatibles}</Typography>
    </CardContent>
</Card> */}