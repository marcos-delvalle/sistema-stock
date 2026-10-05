import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, Chip } from '@mui/material'
import {articulos, movimientos} from '../data/mockData'

function Dashboard({articulos}) {
    const bajoStock = articulos.filter((a) => a.stock_actual < a.stock_minimo)
    const totalArticulos = articulos.length

    return(
        <>
        <h1>Dashboard</h1>

        <Box sx={{display:'flex', gap:2, mb:4}}>
            <Card sx={{minWidth: 180}}>
                <CardContent>
                    <Typography color='text.secondary'>Articulos</Typography>
                    <Typography variant='h4'>{totalArticulos}</Typography>
                </CardContent>
            </Card>
            <Card sx={{minWidth: 180}}>
                <CardContent>
                    <Typography color='text.secondary'>Bajo stock</Typography>
                    <Typography variant='h4' color={bajoStock.length > 0 ? 'error' : 'success.main'}>
                        {bajoStock.length}
                    </Typography>
                </CardContent>
            </Card>
            <Card sx={{minWidth: 180}}>
                <CardContent>
                    <Typography color='text.secondary'>Movimientos</Typography>
                    <Typography variant='h4'>
                        {movimientos.length}
                    </Typography>
                </CardContent>
            </Card>
        </Box>

        <h2>Alertas de stock bajo</h2>
        {bajoStock.length === 0 ? (
            <p>Todo en orden 👌</p>
        ) : (
            <List>
                {bajoStock.map((a) => (
                    <ListItem key={a.id}>
                        <ListItemText primary={a.nombre}/>
                        <Chip label={a.stock_actual + ' / min ' + a.stock_minimo} color='error'/>
                    </ListItem>
                ))}
            </List>
        )}

        </>
    )
}

export default Dashboard;