import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Button, Box, IconButton, Typography, Tooltip, TableSortLabel,
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useState } from 'react'
import ArticuloDialog from '../components/ArticuloDialog'

function Articulos({ articulos, setArticulos, categorias }) {

    const [articuloEditando, setArticuloEditando] = useState(null)
    const [dialogoAbierto, setDialogoAbierto] = useState(false)
    const [orden, setOrden] = useState({ campo: 'nombre', dir: 'asc' })

    function abrirNuevo() {
        setArticuloEditando(null)
        setDialogoAbierto(true)
    }

    function abrirEdicion(a) {
        setArticuloEditando(a)
        setDialogoAbierto(true)
    }

    function categoriaDe(a) {
        return categorias.find((c) => c.id === a.categoria_id)?.nombre || '—'
    }

    function cambiarOrden(campo) {
        setOrden((prev) => ({
            campo,
            dir: prev.campo === campo && prev.dir === 'asc' ? 'desc' : 'asc',
        }))
    }

    const ordenados = [...articulos].sort((a, b) => {
        let va, vb

        if (orden.campo === 'nombre') { va = a.nombre; vb = b.nombre }
        else if (orden.campo === 'categoria') { va = categoriaDe(a); vb = categoriaDe(b) }
        else if (orden.campo === 'stock') { va = a.stock_actual; vb = b.stock_actual }
        else if (orden.campo === 'estado') { va = a.activo ? 1 : 0; vb = b.activo ? 1 : 0 }

        const resultado = typeof va === 'string'
            ? va.localeCompare(vb, 'es')
            : va - vb

        return orden.dir === 'asc' ? resultado : -resultado
    })

    function columna(campo, label, align) {
        return (
            <TableCell
                key={campo}
                align={align}
                onClick={() => cambiarOrden(campo)}
                sx={{ cursor: 'pointer', userSelect: 'none' }}
                aria-sort={orden.campo === campo ? (orden.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
                <TableSortLabel
                    active={orden.campo === campo}
                    direction={orden.campo === campo ? orden.dir : 'asc'}
                >
                    {label}
                </TableSortLabel>
            </TableCell>
        )
    }

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Artículos</Typography>
                <Button variant="contained" onClick={abrirNuevo}>Nuevo artículo</Button>
            </Box>

            <ArticuloDialog
                key={articuloEditando?.id ?? 'nuevo'}
                abierto={dialogoAbierto}
                onCerrar={() => setDialogoAbierto(false)}
                categorias={categorias}
                articulo={articuloEditando}
                setArticulos={setArticulos}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columna('nombre', 'Nombre')}
                            {columna('categoria', 'Categoría')}
                            {columna('stock', 'Stock')}
                            {columna('estado', 'Estado')}
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ordenados.map((a) => (
                            <TableRow key={a.id} sx={{ opacity: a.activo ? 1 : 0.5 }}>
                                <TableCell>{a.nombre}</TableCell>
                                <TableCell>{categoriaDe(a)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={`${a.stock_actual} / mín ${a.stock_minimo}`}
                                        color={a.stock_actual < a.stock_minimo ? 'error' : 'success'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={a.activo ? 'Activo' : 'Inactivo'}
                                        color={a.activo ? 'success' : 'default'}
                                        variant={a.activo ? 'filled' : 'outlined'}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Editar">
                                        <IconButton onClick={() => abrirEdicion(a)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
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