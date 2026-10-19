import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Typography } from '@mui/material'
import { formatearFecha } from '../utils/fecha'

function Historial({ movimientos, articulos, oficinas }) {

    return (
        <>
            <Typography variant="h4" sx={{ mb: 2 }}>Historial</Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Artículo</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell align="right">Cantidad</TableCell>
                            <TableCell>Oficina</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {movimientos.map((m) => (
                            <TableRow key={m.id}>
                                <TableCell>{formatearFecha(m.fecha)}</TableCell>
                                <TableCell>{articulos.find((a) => a.id === m.articulo_id)?.nombre}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={m.tipo}
                                        color={m.tipo === 'entrada' ? 'success' : 'primary'}
                                    />
                                </TableCell>
                                <TableCell align="right">{m.cantidad}</TableCell>
                                <TableCell>{oficinas.find((o) => o.id === m.oficina_id)?.nombre || '—'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
export default Historial;