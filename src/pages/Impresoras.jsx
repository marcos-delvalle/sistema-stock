import {Box, Card, CardContent, Typography , Button, Chip, CardHeader} from '@mui/material'

function Impresoras({modelos, unidades, oficinas, articulos, setModelos, setUnidades}){

    return(
        <>
        <h1>Impresoras</h1>
        <Box sx={{display:'flex', flexWrap:'wrap', gap:2}}>
            {modelos.map((m) => (
                <Card key={m.id} sx={{minWidth: 220}}>
                    <CardContent>
                        <Typography variant='h6'>{m.marca} {m.modelo}</Typography>
                        <Typography variant='body2'>
                            Toner: {articulos.find((a) => a.id === m.articulo_id)?.nombre}
                        </Typography>
                        <Typography variant='body2'>
                            Asignadas: {unidades.filter((u) => u.modelo_id === m.id).length}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
        </>
    )
}
export default Impresoras