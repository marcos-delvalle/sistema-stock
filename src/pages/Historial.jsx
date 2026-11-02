import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Typography,
} from '@mui/material'
import { useState } from 'react'
import { formatearFecha } from '../utils/fecha'
import Buscador from '../components/Buscador'
import { normalizar } from '../utils/texto'

function Historial({ movimientos, articulos, oficinas }) {

    const [busqueda, setBusqueda] = useState('')

    const termino = normalizar(busqueda)

    const filtrados = movimientos.filter((m) => {
        if (!termino) return true

        const articuloNombre = m.articulo_nombre || articulos.find((a) => a.id === m.articulo_id)?.nombre || ''
        const oficinaNombre = m.oficina_nombre || oficinas.find((o) => o.id === m.oficina_id)?.nombre || ''
        const tipoTexto = m.tipo === 'entrada' ? 'entrada' : 'salida'
        const estadoStock = m.afecta_stock === false ? 'no afecta stock' : ''

        return [articuloNombre, oficinaNombre, tipoTexto, estadoStock, String(m.fecha), formatearFecha(m.fecha)]
            .some((texto) => normalizar(texto).includes(termino))
    })

    const ordenados = [...filtrados].sort(
        (a, b) => String(b.fecha).localeCompare(String(a.fecha)) || b.id - a.id
    )

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 2,
                }}
            >
                <Typography variant="h4">Historial</Typography>
                <Buscador
                    valor={busqueda}
                    onChange={setBusqueda}
                    placeholder="Buscar por artículo, oficina, tipo o fecha..."
                />
            </Box>

            {termino && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {filtrados.length} movimiento{filtrados.length === 1 ? '' : 's'}
                </Typography>
            )}

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
                        {ordenados.map((m) => (
                            <TableRow key={m.id}>
                                <TableCell>{formatearFecha(m.fecha)}</TableCell>
                                <TableCell>
                                    {m.articulo_nombre || articulos.find((a) => a.id === m.articulo_id)?.nombre || '—'}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                                            color={m.tipo === 'entrada' ? 'success' : 'primary'}
                                        />
                                        {m.afecta_stock === false && (
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label="No afecta stock"
                                            />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{m.cantidad}</TableCell>
                                <TableCell>
                                    {m.oficina_nombre || oficinas.find((o) => o.id === m.oficina_id)?.nombre || '—'}
                                </TableCell>
                            </TableRow>
                        ))}

                        {ordenados.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    {termino
                                        ? `No se encontraron movimientos para "${busqueda.trim()}".`
                                        : 'Todavía no hay movimientos registrados.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
export default Historial;
