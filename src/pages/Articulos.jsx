import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Button, Box, IconButton, Typography, Tooltip, TableSortLabel,
} from '@mui/material'
import { Category, Edit } from '@mui/icons-material'
import { useState } from 'react'
import ArticuloDialog from '../components/ArticuloDialog'
import CategoriaDialog from '../components/CategoriaDialog'
import Buscador from '../components/Buscador'
import EncabezadoPagina from '../components/EncabezadoPagina'
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
            <EncabezadoPagina
                titulo="Artículos"
                acciones={
                    <>
                        <Button
                            variant="outlined"
                            startIcon={<Category />}
                            onClick={() => setCategoriasAbierto(true)}
                        >
                            Categorías
                        </Button>
                        <Button variant="contained" onClick={abrirNuevo}>Nuevo artículo</Button>
                    </>
                }
            />

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

            {ordenados.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        {termino
                            ? `No se encontraron artículos para "${busqueda.trim()}".`
                            : 'Todavía no hay artículos cargados.'}
                    </Typography>
                </Paper>
            ) : (
                <>
                    <Box
                        sx={{
                            display: { xs: 'flex', sm: 'none' },
                            flexDirection: 'column',
                            gap: 1.5,
                        }}
                    >
                        {ordenados.map((a) => (
                            <Paper
                                key={a.id}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    opacity: a.activo ? 1 : 0.65,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 600, lineHeight: 1.3 }}
                                        >
                                            {a.nombre}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {categoriaDe(a)}
                                        </Typography>
                                    </Box>
                                    <Tooltip title="Editar">
                                        <IconButton
                                            onClick={() => abrirEdicion(a)}
                                            aria-label={`Editar ${a.nombre}`}
                                            sx={{ mt: -0.5, mr: -1 }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                                    <Chip
                                        size="small"
                                        label={`Stock: ${a.stock_actual} / mín ${a.stock_minimo}`}
                                        color={a.stock_actual < a.stock_minimo ? 'error' : 'success'}
                                    />
                                    <Chip
                                        size="small"
                                        label={a.activo ? 'Activo' : 'Inactivo'}
                                        color={a.activo ? 'success' : 'default'}
                                        variant={a.activo ? 'filled' : 'outlined'}
                                    />
                                </Box>
                            </Paper>
                        ))}
                    </Box>

                    <TableContainer
                        component={Paper}
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                        <Table
                            sx={{
                                minWidth: 520,
                                '& .MuiTableCell-root': { px: { xs: 1.25, sm: 2 } },
                            }}
                        >
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
            )}
        </>
    )
}
export default Articulos;
