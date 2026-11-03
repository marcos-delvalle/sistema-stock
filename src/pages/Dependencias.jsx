import {
    Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip,
    IconButton, InputAdornment, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material'
import { Add, Business, Clear, Edit, ExpandMore, Search, SearchOff, Visibility } from '@mui/icons-material'
import { useState } from 'react'
import DependenciaDialog from '../components/DependenciaDialog'
import OficinaDialog from '../components/OficinaDialog'
import OficinaDetalleDialog from '../components/OficinaDetalleDialog'
import EncabezadoPagina from '../components/EncabezadoPagina'
import { normalizar } from '../utils/texto'

function Dependencias({
    dependencias, oficinas, unidades, modelos, movimientos, articulos,
}) {

    // undefined = cerrado · null = creando · objeto = editando
    const [depEditando, setDepEditando] = useState(undefined)
    const [oficinaEditando, setOficinaEditando] = useState(undefined)
    const [depParaOficina, setDepParaOficina] = useState(null)
    const [oficinaDetalle, setOficinaDetalle] = useState(null)
    const [busqueda, setBusqueda] = useState('')
    const [expandidas, setExpandidas] = useState({})

    const dependenciasActivas = dependencias.filter((d) => d.activo)
    const oficinasActivas = oficinas.filter((o) => o.activo)

    const termino = normalizar(busqueda)

    // Si el término coincide con la dependencia, se muestran todas sus oficinas.
    // Si coincide solo con una oficina, se muestra esa oficina dentro de su dependencia.
    const resultados = dependenciasActivas
        .map((dep) => {
            const todas = oficinasActivas
                .filter((o) => o.dependencia_id === dep.id)
                .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

            const coincideDependencia = normalizar(dep.nombre).includes(termino)
            const visibles = !termino || coincideDependencia
                ? todas
                : todas.filter((o) => normalizar(o.nombre).includes(termino))

            return {
                dep,
                oficinas: visibles,
                visible: !termino || coincideDependencia || visibles.length > 0,
            }
        })
        .filter((r) => r.visible)

    const totalOficinasVisibles = resultados.reduce((acc, r) => acc + r.oficinas.length, 0)

    function abrirNuevaOficina(depId) {
        setBusqueda('')
        setExpandidas((prev) => ({ ...prev, [depId]: true }))
        setOficinaEditando(null)
        setDepParaOficina(depId)
    }

    function impresorasDe(oficinaId) {
        return unidades.filter((u) => u.oficina_id === oficinaId).length
    }

    function salidasDe(oficinaId) {
        return movimientos.filter((m) => m.tipo === 'salida' && m.oficina_id === oficinaId).length
    }

    return (
        <>
            <EncabezadoPagina
                titulo="Dependencias"
                acciones={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                            setBusqueda('')
                            setDepEditando(null)
                        }}
                    >
                        Nueva dependencia
                    </Button>
                }
            />

            {dependenciasActivas.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Buscar dependencia u oficina..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        sx={{ minWidth: { xs: '100%', sm: 300 }, maxWidth: 480, flexGrow: 1 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: busqueda ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            aria-label="Limpiar búsqueda"
                                            onClick={() => setBusqueda('')}
                                        >
                                            <Clear fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
                    />

                    {termino && (
                        <Typography variant="body2" color="text.secondary">
                            {resultados.length} dependencia{resultados.length === 1 ? '' : 's'} ·{' '}
                            {totalOficinasVisibles} oficina{totalOficinasVisibles === 1 ? '' : 's'}
                        </Typography>
                    )}
                </Box>
            )}

            {dependenciasActivas.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 4 }}>
                    Todavía no hay dependencias cargadas.
                </Typography>
            )}

            {termino && resultados.length === 0 && (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                    <SearchOff sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                        No se encontraron dependencias ni oficinas para "{busqueda.trim()}".
                    </Typography>
                    <Button sx={{ mt: 1 }} onClick={() => setBusqueda('')}>
                        Limpiar búsqueda
                    </Button>
                </Box>
            )}

            {resultados.map(({ dep, oficinas: oficinasDep }) => {
                const idsOficinas = oficinasDep.map((o) => o.id)
                const impresorasDep = unidades.filter((u) => idsOficinas.includes(u.oficina_id))
                const salidasDep = movimientos.filter(
                    (m) => m.tipo === 'salida' && idsOficinas.includes(m.oficina_id)
                )

                return (
                    <Accordion
                        key={dep.id}
                        disableGutters
                        expanded={Boolean(termino) || Boolean(expandidas[dep.id])}
                        onChange={(e, abierto) => {
                            if (!termino) {
                                setExpandidas((prev) => ({ ...prev, [dep.id]: abierto }))
                            }
                        }}
                        sx={{
                            mb: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            '&:before': { display: 'none' },
                            '&.Mui-expanded': { mt: 0, mb: 1.5 },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccordionSummary expandIcon={<ExpandMore />} sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                    <Business color="primary" />
                                    <Typography variant="h6">{dep.nombre}</Typography>
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={`${oficinasDep.length} oficina${oficinasDep.length === 1 ? '' : 's'}`}
                                    />
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={`${impresorasDep.length} impresora${impresorasDep.length === 1 ? '' : 's'}`}
                                    />
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={`${salidasDep.length} salida${salidasDep.length === 1 ? '' : 's'}`}
                                    />
                                </Box>
                            </AccordionSummary>

                            <Tooltip title="Editar dependencia">
                                <IconButton
                                    sx={{ mr: 1 }}
                                    onClick={() => setDepEditando(dep)}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <AccordionDetails>
                            {oficinasDep.length === 0 ? (
                                <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                                    Esta dependencia todavía no tiene oficinas.
                                </Typography>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            display: { xs: 'flex', sm: 'none' },
                                            flexDirection: 'column',
                                            gap: 1,
                                        }}
                                    >
                                        {oficinasDep.map((oficina) => {
                                            const cantImpresoras = impresorasDe(oficina.id)
                                            const cantSalidas = salidasDe(oficina.id)

                                            return (
                                                <Paper
                                                    key={oficina.id}
                                                    variant="outlined"
                                                    onClick={() => setOficinaDetalle(oficina)}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        opacity: oficina.activo ? 1 : 0.6,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ fontWeight: 600, flexGrow: 1 }}
                                                        >
                                                            {oficina.nombre}
                                                        </Typography>
                                                        <Tooltip title="Ver impresoras e historial">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setOficinaDetalle(oficina)
                                                                }}
                                                                aria-label={`Ver ${oficina.nombre}`}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar oficina">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setOficinaEditando(oficina)
                                                                    setDepParaOficina(oficina.dependencia_id)
                                                                }}
                                                                aria-label={`Editar ${oficina.nombre}`}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
                                                        <Chip
                                                            size="small"
                                                            label={`${cantImpresoras} impresora${cantImpresoras === 1 ? '' : 's'}`}
                                                            color={cantImpresoras > 0 ? 'primary' : 'default'}
                                                            variant={cantImpresoras > 0 ? 'filled' : 'outlined'}
                                                        />
                                                        <Chip
                                                            size="small"
                                                            label={`${cantSalidas} salida${cantSalidas === 1 ? '' : 's'}`}
                                                            color={cantSalidas > 0 ? 'info' : 'default'}
                                                            variant={cantSalidas > 0 ? 'filled' : 'outlined'}
                                                        />
                                                        {!oficina.activo && (
                                                            <Chip size="small" label="Inactiva" variant="outlined" />
                                                        )}
                                                    </Box>
                                                </Paper>
                                            )
                                        })}
                                    </Box>

                                    <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
                                        <Table
                                            size="small"
                                            sx={{
                                                minWidth: 480,
                                                '& .MuiTableCell-root': { px: { xs: 1, sm: 2 } },
                                            }}
                                        >
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Oficina</TableCell>
                                                    <TableCell>Impresoras</TableCell>
                                                    <TableCell>Salidas</TableCell>
                                                    <TableCell align="right">Acciones</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {oficinasDep.map((oficina) => {
                                                    const cantImpresoras = impresorasDe(oficina.id)
                                                    const cantSalidas = salidasDe(oficina.id)

                                                    return (
                                                        <TableRow
                                                            key={oficina.id}
                                                            hover
                                                            sx={{ cursor: 'pointer' }}
                                                            onClick={() => setOficinaDetalle(oficina)}
                                                        >
                                                            <TableCell>{oficina.nombre}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="small"
                                                                    label={cantImpresoras}
                                                                    color={cantImpresoras > 0 ? 'primary' : 'default'}
                                                                    variant={cantImpresoras > 0 ? 'filled' : 'outlined'}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    size="small"
                                                                    label={cantSalidas}
                                                                    color={cantSalidas > 0 ? 'info' : 'default'}
                                                                    variant={cantSalidas > 0 ? 'filled' : 'outlined'}
                                                                />
                                                            </TableCell>
                                                            <TableCell
                                                                align="right"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Tooltip title="Ver impresoras e historial">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => setOficinaDetalle(oficina)}
                                                                    >
                                                                        <Visibility fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Editar oficina">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => {
                                                                            setOficinaEditando(oficina)
                                                                            setDepParaOficina(oficina.dependencia_id)
                                                                        }}
                                                                    >
                                                                        <Edit fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </AccordionDetails>
                    </Accordion>
                )
            })}

            {depEditando !== undefined && (
                <DependenciaDialog
                    abierto
                    onCerrar={() => setDepEditando(undefined)}
                    dependencia={depEditando}
                    oficinas={oficinasActivas}
                    onAgregarOficina={depEditando ? () => abrirNuevaOficina(depEditando.id) : undefined}
                />
            )}

            {oficinaEditando !== undefined && (
                <OficinaDialog
                    abierto
                    onCerrar={() => setOficinaEditando(undefined)}
                    oficina={oficinaEditando}
                    dependenciaId={oficinaEditando?.dependencia_id ?? depParaOficina}
                    dependencias={dependenciasActivas}
                    unidades={unidades}
                    oficinas={oficinasActivas}
                />
            )}

            {oficinaDetalle && (
                <OficinaDetalleDialog
                    abierto
                    onCerrar={() => setOficinaDetalle(null)}
                    oficina={oficinaDetalle}
                    dependencia={dependenciasActivas.find((d) => d.id === oficinaDetalle.dependencia_id)}
                    unidades={unidades}
                    modelos={modelos}
                    oficinas={oficinasActivas}
                    articulos={articulos}
                    movimientos={movimientos}
                />
            )}
        </>
    )
}

export default Dependencias
