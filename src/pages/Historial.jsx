import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, Button, Box} from '@mui/material'

function Historial({movimientos, setMovimientos}){
    
    return(
     <>
        <h1>Historial</h1>   
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>FECHA</TableCell>
                        <TableCell>TIPO</TableCell>
                        <TableCell>CANTIDAD</TableCell>
                        <TableCell>DESTINO</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {movimientos.map((a) => (
                        <TableRow key={a.id}>
                            <TableCell>{a.fecha}</TableCell>
                            <TableCell><Chip label={a.tipo} color={a.tipo === "entrada" ? 'success' : 'primary' }/></TableCell>
                            <TableCell>{a.cantidad}</TableCell>
                            <TableCell>{a.destino}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
     </>   
    )
}
export default Historial;