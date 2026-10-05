import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, Button, Box} from '@mui/material'
import { articulos } from '../data/mockData'
import { useState } from 'react';

function Articulos(){

    const [articulosState, setArticulosState] = useState(articulos);
    const [nombre, setNombre] = useState("")

    function agregar(){
        if(!nombre) return
        const nuevo = {id: Date.now(), nombre, sn:'NUEVO', stock_actual:0, stock_minimo:5}
        setArticulosState([...articulosState, nuevo])
        setNombre("")
    }

    return(
        <>
        <h1>Articulos</h1>
        <Box sx={{display:'flex', gap:2, mb:3}}>
            <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}/>
            <Button variant='contained' onClick={agregar}>Agregar</Button>
        </Box>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>SN</TableCell>
                        <TableCell>Stock</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {articulosState.map((a) => (
                        <TableRow key={a.id}>
                            <TableCell>{a.nombre}</TableCell>
                            <TableCell>{a.sn}</TableCell>
                            <TableCell>
                                {a.stock_actual < a.stock_minimo ? (
                                    <Chip label={a.stock_actual} color='error'/>
                                ) : (
                                    a.stock_actual
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </>
    )
}
export default Articulos;