import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, IconButton, Tooltip, Typography, FormControlLabel, Checkbox,
} from '@mui/material'
import { Edit, Lock, ReportProblem } from '@mui/icons-material'
import { useState } from 'react'
import { formatearFecha } from '../utils/fecha'
import Buscador from '../components/Buscador'
import EncabezadoPagina from '../components/EncabezadoPagina'
import MovimientoDialog from '../components/MovimientoDialog'
import { normalizar } from '../utils/texto'
import {
    cantidadVisible, colorTipo, detalleAjuste, destinoVisible, etiquetaTipo,
} from '../utils/movimientos'

function Historial({ movimientos, articulos, oficinas, categorias, dependencias }) {

    const [busqueda, setBusqueda] = useState('')
    const [soloFallas, setSoloFallas] = useState(false)
    const [movimientoEditando, setMovimientoEditando] = useState(null)

    const termino = normalizar(busqueda)

    const filtrados = movimientos.filter((m) => {
        if (soloFallas && !m.reporta_falla) return false
        if (!termino) return true

        const articuloNombre = m.articulo_nombre || articulos.find((a) => a.id === m.articulo_id)?.nombre || ''
        const oficinaNombre = m.oficina_nombre || oficinas.find((o) => o.id === m.oficina_id)?.nombre || ''
        const tipoTexto = etiquetaTipo(m.tipo)
        const estadoStock = m.afecta_stock === false ? 'no afecta stock' : ''
        const ajusteTexto = m.tipo === 'ajuste' ? `${detalleAjuste(m)} ajuste` : ''
        const fallaTexto = m.reporta_falla ? 'falla fallado' : ''

        return [articuloNombre, oficinaNombre, tipoTexto, estadoStock, ajusteTexto, fallaTexto, String(m.fecha), formatearFecha(m.fecha)]
            .some((texto) => normalizar(texto).includes(termino))
    })

    const ordenados = [...filtrados].sort(
        (a, b) => String(b.fecha).localeCompare(String(a.fecha)) || b.id - a.id
    )

    // Al editar se incluye el artículo/oficina actual aunque esté inactivo,
    // para poder conservar el movimiento histórico.
    const articulosEdicion = articulos.filter(
        (a) => a.activo || a.id === movimientoEditando?.articulo_id
    )
    const oficinasEdicion = oficinas.filter(
        (o) => o.activo || o.id === movimientoEditando?.oficina_id
    )

    const hayFiltro = Boolean(termino) || soloFallas

    return (
        <>
            <EncabezadoPagina
                titulo="Historial"
                acciones={
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            gap: 1,
                            width: { xs: '100%', sm: 'auto' },
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={soloFallas}
                                    onChange={(e) => setSoloFallas(e.target.checked)}
                                />
                            }
                            label="Solo con fallas"
                            sx={{ m: 0, whiteSpace: 'nowrap' }}
                        />
                        <Buscador
                            valor={busqueda}
                            onChange={setBusqueda}
                            placeholder="Buscar por artículo, oficina, tipo o fecha..."
                            sx={{ minWidth: { xs: '100%', sm: 400 } }}
                        />
                    </Box>
                }
            />

            {hayFiltro && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {filtrados.length} movimiento{filtrados.length === 1 ? '' : 's'}
                </Typography>
            )}

            {ordenados.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        {soloFallas && !termino
                            ? 'No hay movimientos con fallas reportadas.'
                            : termino
                                ? `No se encontraron movimientos${soloFallas ? ' con fallas' : ''} para "${busqueda.trim()}".`
                                : 'Todavía no hay movimientos registrados.'}
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
                            const articuloNombre = m.articulo_nombre
                                || articulos.find((a) => a.id === m.articulo_id)?.nombre
                                || '—'
                            const oficinaNombre = destinoVisible(m, oficinas)

                            return (
                                <Paper key={m.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            {formatearFecha(m.fecha)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Chip
                                                size="small"
                                                label={etiquetaTipo(m.tipo)}
                                                color={colorTipo(m.tipo)}
                                            />
                                            {m.reporta_falla && (
                                                <Tooltip title="Tóner reemplazado reportado como fallado">
                                                    <Box component="span" sx={{ display: 'inline-flex' }}>
                                                        <ReportProblem color="warning" fontSize="small" />
                                                    </Box>
                                                </Tooltip>
                                            )}
                                            {m.tipo !== 'ajuste' && (
                                                <Tooltip title="Editar movimiento">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setMovimientoEditando(m)}
                                                        aria-label={`Editar movimiento de ${articuloNombre}`}
                                                        sx={{ mr: -1 }}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </Box>

                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 600, mt: 0.5, lineHeight: 1.3 }}
                                    >
                                        {articuloNombre}
                                    </Typography>

                                    {m.tipo === 'ajuste' && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: 'block', mt: 0.25 }}
                                        >
                                            {detalleAjuste(m)}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={`Cantidad: ${cantidadVisible(m)}`}
                                        />
                                        {m.tipo === 'salida' && (
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label={oficinaNombre}
                                            />
                                        )}
                                        {m.afecta_stock === false && (
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label="No afecta stock"
                                            />
                                        )}
                                    </Box>
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
                                minWidth: 640,
                                '& .MuiTableCell-root': { px: { xs: 1.25, sm: 2 } },
                            }}
                        >
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Artículo</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                <TableCell>Oficina</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ordenados.map((m) => {
                                const articuloNombre = m.articulo_nombre
                                    || articulos.find((a) => a.id === m.articulo_id)?.nombre
                                    || '—'

                                return (
                                    <TableRow key={m.id}>
                                        <TableCell>{formatearFecha(m.fecha)}</TableCell>
                                        <TableCell>
                                            {articuloNombre}
                                            {m.tipo === 'ajuste' && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: 'block' }}
                                                >
                                                    {detalleAjuste(m)}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                                <Chip
                                                    label={etiquetaTipo(m.tipo)}
                                                    color={colorTipo(m.tipo)}
                                                />
                                                {m.reporta_falla && (
                                                    <Tooltip title="Tóner reemplazado reportado como fallado">
                                                        <Box component="span" sx={{ display: 'inline-flex' }}>
                                                            <ReportProblem color="warning" fontSize="small" />
                                                        </Box>
                                                    </Tooltip>
                                                )}
                                                {m.afecta_stock === false && (
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        label="No afecta stock"
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">{cantidadVisible(m)}</TableCell>
                                        <TableCell>
                                            {m.tipo === 'ajuste'
                                                ? '—'
                                                : (m.oficina_nombre
                                                    || oficinas.find((o) => o.id === m.oficina_id)?.nombre
                                                    || '—')}
                                        </TableCell>
                                        <TableCell align="right">
                                            {m.tipo === 'ajuste' ? (
                                                <Tooltip title="Los ajustes no se editan">
                                                    <Box component="span" sx={{ display: 'inline-flex' }}>
                                                        <Lock fontSize="small" color="disabled" />
                                                    </Box>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="Editar movimiento">
                                                    <IconButton
                                                        onClick={() => setMovimientoEditando(m)}
                                                        aria-label={`Editar movimiento de ${articuloNombre}`}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    </TableContainer>
                </>
            )}

            {movimientoEditando && (
                <MovimientoDialog
                    abierto
                    onCerrar={() => setMovimientoEditando(null)}
                    movimiento={movimientoEditando}
                    articulos={articulosEdicion}
                    oficinas={oficinasEdicion}
                    categorias={categorias}
                    dependencias={dependencias}
                />
            )}
        </>
    )
}
export default Historial;
