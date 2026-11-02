import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Button, Box, IconButton, Typography, Tooltip, TableSortLabel,
} from '@mui/material'
import { Category, Edit } from '@mui/icons-material'
import { useState } from 'react'
import ArticuloDialog from '../components/ArticuloDialog'
import CategoriaDialog from '../components/CategoriaDialog'
import Buscador from '../components/Buscador'
import { normalizar } from '../utils/texto'

function Articulos({ articulos, categorias }) {

    const [articuloEditando, setArticuloEditando] = useState(null)
    const [dialogoAbierto, setDialogoAbierto] = useState(false)
    const [categoriasAbierto, setCategoriasAbierto] = useState(false)
    const [orden, setOrden] = useState({ campo: 'nombre', dir: 'asc' })
    const [busqueda, setBusqueda] = useState('')

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

    const termino = normalizar(busqueda)

    const filtrados = articulos.filter((a) => (
        !termino ||
        normalizar(a.nombre).includes(termino) ||
        normalizar(categoriaDe(a)).includes(termino)
    ))

    const ordenados = [...filtrados].sort((a, b) => {
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Category />}
                        onClick={() => setCategoriasAbierto(true)}
                    >
                        Categorías
                    </Button>
                    <Button variant="contained" onClick={abrirNuevo}>Nuevo artículo</Button>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Buscador
                    valor={busqueda}
                    onChange={setBusqueda}
                    placeholder="Buscar por nombre o categoría..."
                />
                {termino && (
                    <Typography variant="body2" color="text.secondary">
                        {filtrados.length} artículo{filtrados.length === 1 ? '' : 's'}
                    </Typography>
                )}
            </Box>

            <ArticuloDialog
                key={articuloEditando?.id ?? 'nuevo'}
                abierto={dialogoAbierto}
                onCerrar={() => setDialogoAbierto(false)}
                categorias={categorias}
                articulo={articuloEditando}
            />

            <CategoriaDialog
                abierto={categoriasAbierto}
                onCerrar={() => setCategoriasAbierto(false)}
                categorias={categorias}
                articulos={articulos}
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

                        {ordenados.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    {termino
                                        ? `No se encontraron artículos para "${busqueda.trim()}".`
                                        : 'Todavía no hay artículos cargados.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
export default Articulos;
