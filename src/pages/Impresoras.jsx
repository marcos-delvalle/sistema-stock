import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip} from '@mui/material'

function Impresoras({impresoras, articulos, compatibilidades}){

    return(
        <>
        <h1>Impresoras</h1>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>MARCA</TableCell>
                        <TableCell>MODELO</TableCell>
                        <TableCell>COMPATIBLE</TableCell>
                        <TableCell>UBICACIÓN</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {impresoras.map((imp) => (
                        <TableRow key={imp.id}>
                            <TableCell>{imp.marca}</TableCell>
                            <TableCell>{imp.modelo}</TableCell>
                            <TableCell>
                                {compatibilidades
                                .filter((c) => c.impresora_id === imp.id)
                                .map((c) => articulos.find((a) => a.id === c.articulo_id)?.nombre)
                                .map((c) => <Chip label={c}></Chip>) || 'Sin compatibles'}
                            </TableCell>
                            <TableCell>{imp.ubicacion}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </>
    )
}
export default Impresoras