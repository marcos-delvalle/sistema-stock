import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, Button, Box} from '@mui/material'
import { useState } from 'react';

function Articulos({articulos, setArticulos}){

    const [nombre, setNombre] = useState("")
    
    function agregar(){
        if(!nombre) return
        setArticulos([...articulos, {id: Date.now(), nombre, sn:'NUEVO', stock_actual:0, stock_minimo:5}])
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
                    {articulos.map((a) => (
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