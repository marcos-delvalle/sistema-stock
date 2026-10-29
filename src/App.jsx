import { useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import {
    Alert, AppBar, Box, Button, CircularProgress, Drawer, IconButton,
    LinearProgress, List, ListItemButton, ListItemText, Snackbar,
    Toolbar, Tooltip, Typography,
} from '@mui/material'
import { Add, Logout } from '@mui/icons-material'
import Articulos from './pages/Articulos'
import Dashboard from './pages/Dashboard'
import Dependencias from './pages/Dependencias'
import Historial from './pages/Historial'
import Impresoras from './pages/Impresoras'
import Login from './pages/Login'
import Toners from './pages/Toners'
import NuevoMovimientoDialog from './components/NuevoMovimientoDialog'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DatosProvider, useDatos } from './context/DatosContext'

const DRAWER_WIDTH = 240

function PantallaCargando({ mensaje }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
            }}
        >
            <CircularProgress />
            <Typography color="text.secondary">{mensaje}</Typography>
        </Box>
    )
}

function PantallaError({ mensaje, onReintentar, onSalir }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                p: 2,
                bgcolor: 'grey.100',
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 520 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {mensaje}
                </Alert>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button onClick={onSalir}>Cerrar sesión</Button>
                    <Button variant="contained" onClick={onReintentar}>Reintentar</Button>
                </Box>
            </Box>
        </Box>
    )
}

function App() {
    return (
        <AuthProvider>
            <Contenido />
        </AuthProvider>
    )
}

function Contenido() {
    const { usuario, cargando } = useAuth()

    if (cargando) {
        return <PantallaCargando mensaje="Verificando sesión..." />
    }

    if (!usuario) {
        return <Login />
    }

    return (
        <DatosProvider>
            <BrowserRouter>
                <Layout usuario={usuario} />
            </BrowserRouter>
        </DatosProvider>
    )
}

function Layout({ usuario }) {
    const {
        articulos, movimientos, modelos, unidades, dependencias, oficinas,
        categorias, cargando, recargando, error, recargar, aviso, cerrarAviso,
    } = useDatos()
    const { salir } = useAuth()
    const location = useLocation()

    const [dialogoAbierto, setDialogoAbierto] = useState(false)
    const [versionMovimiento, setVersionMovimiento] = useState(0)

    const menuItems = [
        { texto: 'Dashboard', ruta: '/' },
        { texto: 'Toners', ruta: '/toners' },
        { texto: 'Impresoras', ruta: '/impresoras' },
        { texto: 'Articulos', ruta: '/articulos' },
        { texto: 'Dependencias', ruta: '/dependencias' },
        { texto: 'Historial', ruta: '/historial' },
    ]

    if (cargando) {
        return <PantallaCargando mensaje="Cargando datos..." />
    }

    if (error) {
        return (
            <PantallaError
                mensaje={error}
                onReintentar={() => recargar({ inicial: true })}
                onSalir={salir}
            />
        )
    }

    const articulosActivos = articulos.filter((a) => a.activo)
    const oficinasActivas = oficinas.filter((o) => o.activo)

    function abrirNuevoMovimiento() {
        setVersionMovimiento((v) => v + 1)
        setDialogoAbierto(true)
    }

    return (
        <>
            {recargando && (
                <LinearProgress
                    sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }}
                />
            )}

            <div style={{ display: 'flex' }}>
                <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Soporte Técnico - Stock
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}
                        >
                            {usuario}
                        </Typography>
                        <Tooltip title="Cerrar sesión">
                            <IconButton color="inherit" onClick={salir} aria-label="Cerrar sesión">
                                <Logout />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>

                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                        <List>
                            {menuItems.map((item) => (
                                <ListItemButton
                                    key={item.ruta}
                                    component={Link}
                                    to={item.ruta}
                                    selected={location.pathname === item.ruta}
                                >
                                    <ListItemText primary={item.texto} />
                                </ListItemButton>
                            ))}
                        </List>
                        <IconButton
                            variant="outlined"
                            sx={{ mt: 'auto', m: 2, width: 'fit-content' }}
                            color="primary"
                            onClick={abrirNuevoMovimiento}
                            aria-label="Nuevo movimiento"
                        >
                            <Add sx={{ width: '100%', height: '3em' }} />
                        </IconButton>
                    </Box>
                </Drawer>

                <NuevoMovimientoDialog
                    key={versionMovimiento}
                    abierto={dialogoAbierto}
                    onCerrar={() => setDialogoAbierto(false)}
                    articulos={articulosActivos}
                    oficinas={oficinasActivas}
                />

                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, minWidth: 0 }}>
                    <Routes>
                        <Route path="/" element={
                            <Dashboard
                                articulos={articulos}
                                movimientos={movimientos}
                                modelos={modelos}
                                unidades={unidades}
                                dependencias={dependencias}
                                oficinas={oficinas}
                                categorias={categorias}
                            />
                        } />
                        <Route path="/toners" element={
                            <Toners
                                articulos={articulos}
                                categorias={categorias}
                                unidades={unidades}
                                modelos={modelos}
                            />
                        } />
                        <Route path="/impresoras" element={
                            <Impresoras
                                modelos={modelos}
                                unidades={unidades}
                                oficinas={oficinas}
                                articulos={articulos}
                                categorias={categorias}
                            />
                        } />
                        <Route path="/articulos" element={
                            <Articulos
                                articulos={articulos}
                                categorias={categorias}
                            />
                        } />
                        <Route path="/dependencias" element={
                            <Dependencias
                                dependencias={dependencias}
                                oficinas={oficinas}
                                movimientos={movimientos}
                                modelos={modelos}
                                unidades={unidades}
                                articulos={articulos}
                            />
                        } />
                        <Route path="/historial" element={
                            <Historial
                                movimientos={movimientos}
                                articulos={articulos}
                                oficinas={oficinas}
                            />
                        } />
                        <Route path="*" element={<h1>404 - No encontrado</h1>} />
                    </Routes>
                </Box>
            </div>

            <Snackbar
                key={aviso?.id}
                open={Boolean(aviso)}
                autoHideDuration={4000}
                onClose={cerrarAviso}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={aviso?.severidad || 'success'}
                    variant="filled"
                    onClose={cerrarAviso}
                    sx={{ width: '100%' }}
                >
                    {aviso?.mensaje}
                </Alert>
            </Snackbar>
        </>
    )
}

export default App
