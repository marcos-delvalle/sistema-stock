import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip} from '@mui/material'

function Historial({movimientos, articulos}){
    
    return(
     <>
        <h1>Historial</h1>   
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>FECHA</TableCell>    
                        <TableCell>ARTICULO</TableCell>
                        <TableCell>TIPO</TableCell>
                        <TableCell>CANTIDAD</TableCell>
                        <TableCell>DESTINO</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {movimientos.map((m) => (
                        <TableRow key={m.id}>
                            <TableCell>{m.fecha}</TableCell>
                            <TableCell>{articulos.find((a) => a.id === m.articulo_id)?.nombre}</TableCell>
                            <TableCell><Chip label={m.tipo} color={m.tipo === "entrada" ? 'success' : 'primary'}/></TableCell>
                            <TableCell>{m.cantidad}</TableCell>
                            <TableCell>{m.destino}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
     </>   
    )
}
export default Historial;