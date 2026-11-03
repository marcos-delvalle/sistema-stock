import {
    Box, Button, Chip, IconButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TableSortLabel, Tooltip, Typography,
} from '@mui/material'
import { Business } from '@mui/icons-material'
import { useState } from 'react'
import OficinasAsignadasDialog from '../components/OficinasAsignadasDialog'
import CrearImpresoraDialog from '../components/CrearImpresoraDialog'
import Buscador from '../components/Buscador'
import EncabezadoPagina from '../components/EncabezadoPagina'
import { normalizar } from '../utils/texto'

function Impresoras({ modelos, unidades, oficinas, articulos, categorias }) {

    const [dialogoCrear, setDialogoCrear] = useState(false)
    const [modeloSeleccionado, setModeloSeleccionado] = useState(null)
    const [dialogoVer, setDialogoVer] = useState(false)
    const [orden, setOrden] = useState({ campo: 'marca', dir: 'asc' })
    const [busqueda, setBusqueda] = useState('')

    function abrirModelo(m) {
        setModeloSeleccionado(m)
        setDialogoVer(true)
    }

    function tonerDe(m) {
        return articulos.find((a) => a.id === m.articulo_id)?.nombre || '—'
    }

    function asignadasDe(m) {
        return unidades.filter((u) => u.modelo_id === m.id).length
    }

    function cambiarOrden(campo) {
        setOrden((prev) => ({
            campo,
            dir: prev.campo === campo && prev.dir === 'asc' ? 'desc' : 'asc',
        }))
    }

    const termino = normalizar(busqueda)

    const filtrados = modelos.filter((m) => (
        !termino ||
        normalizar(m.marca).includes(termino) ||
        normalizar(m.modelo).includes(termino) ||
        normalizar(tonerDe(m)).includes(termino)
    ))

    const ordenados = [...filtrados].sort((a, b) => {
        let va, vb

        if (orden.campo === 'marca') { va = a.marca; vb = b.marca }
        else if (orden.campo === 'modelo') { va = a.modelo; vb = b.modelo }
        else if (orden.campo === 'toner') { va = tonerDe(a); vb = tonerDe(b) }
        else if (orden.campo === 'asignadas') { va = asignadasDe(a); vb = asignadasDe(b) }

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
                titulo="Impresoras"
                acciones={
                    <Button variant="contained" onClick={() => setDialogoCrear(true)}>
                        Nueva impresora
                    </Button>
                }
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Buscador
                    valor={busqueda}
                    onChange={setBusqueda}
                    placeholder="Buscar por marca, modelo o tóner..."
                />
                {termino && (
                    <Typography variant="body2" color="text.secondary">
                        {filtrados.length} impresora{filtrados.length === 1 ? '' : 's'}
                    </Typography>
                )}
            </Box>

            <CrearImpresoraDialog
                abierto={dialogoCrear}
                onCerrar={() => setDialogoCrear(false)}
                modelos={modelos}
                articulos={articulos}
                categorias={categorias}
            />

            {ordenados.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        {termino
                            ? `No se encontraron impresoras para "${busqueda.trim()}".`
                            : 'No hay impresoras cargadas'}
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
                        {ordenados.map((m) => {
                            const asignadas = asignadasDe(m)

                            return (
                                <Paper
                                    key={m.id}
                                    variant="outlined"
                                    onClick={() => abrirModelo(m)}
                                    sx={{ p: 2, borderRadius: 2, cursor: 'pointer' }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{ fontWeight: 600, lineHeight: 1.3 }}
                                            >
                                                {m.marca} {m.modelo}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Tóner: {tonerDe(m)}
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Ver oficinas asignadas">
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    abrirModelo(m)
                                                }}
                                                aria-label={`Ver oficinas de ${m.marca} ${m.modelo}`}
                                                sx={{ mt: -0.5, mr: -1 }}
                                            >
                                                <Business fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    <Chip
                                        size="small"
                                        label={`${asignadas} asignada${asignadas === 1 ? '' : 's'}`}
                                        color={asignadas > 0 ? 'primary' : 'default'}
                                        variant={asignadas > 0 ? 'filled' : 'outlined'}
                                        sx={{ mt: 1.5 }}
                                    />
                                </Paper>
                            )
                        })}
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
                                {columna('marca', 'Marca')}
                                {columna('modelo', 'Modelo')}
                                {columna('toner', 'Tóner')}
                                {columna('asignadas', 'Asignadas', 'right')}
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ordenados.map((m) => (
                                <TableRow
                                    key={m.id}
                                    hover
                                    onClick={() => abrirModelo(m)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{m.marca}</TableCell>
                                    <TableCell>{m.modelo}</TableCell>
                                    <TableCell>{tonerDe(m)}</TableCell>
                                    <TableCell align="right">{asignadasDe(m)}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Ver oficinas asignadas">
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    abrirModelo(m)
                                                }}
                                            >
                                                <Business fontSize="small" />
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

            <OficinasAsignadasDialog
                abierto={dialogoVer}
                onCerrar={() => setDialogoVer(false)}
                modelo={modeloSeleccionado}
                unidades={unidades}
                oficinas={oficinas.filter((o) => o.activo)}
            />
        </>
    )
}
export default Impresoras;
