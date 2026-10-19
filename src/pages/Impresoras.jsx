import {
    Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TableSortLabel, Tooltip, Typography,
} from '@mui/material'
import { Business } from '@mui/icons-material'
import { useState } from 'react'
import OficinasAsignadasDialog from '../components/OficinasAsignadasDialog'
import CrearImpresoraDialog from '../components/CrearImpresoraDialog'

function Impresoras({ modelos, unidades, oficinas, articulos, categorias, setModelos, setUnidades }) {

    const [dialogoCrear, setDialogoCrear] = useState(false)
    const [modeloSeleccionado, setModeloSeleccionado] = useState(null)
    const [dialogoVer, setDialogoVer] = useState(false)
    const [orden, setOrden] = useState({ campo: 'marca', dir: 'asc' })

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

    const ordenados = [...modelos].sort((a, b) => {
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Impresoras</Typography>
                <Button variant="contained" onClick={() => setDialogoCrear(true)}>Nueva impresora</Button>
            </Box>

            <CrearImpresoraDialog
                abierto={dialogoCrear}
                onCerrar={() => setDialogoCrear(false)}
                modelos={modelos}
                setModelos={setModelos}
                articulos={articulos}
                categorias={categorias}
            />

            <TableContainer component={Paper}>
                <Table>
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

                        {modelos.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                        No hay impresoras cargadas
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <OficinasAsignadasDialog
                abierto={dialogoVer}
                onCerrar={() => setDialogoVer(false)}
                modelo={modeloSeleccionado}
                unidades={unidades}
                oficinas={oficinas}
                setUnidades={setUnidades}
            />
        </>
    )
}
export default Impresoras;
