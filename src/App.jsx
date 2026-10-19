import {BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Box, IconButton } from "@mui/material"
import Articulos from './pages/Articulos'
import Dashboard from './pages/Dashboard'
import Historial from "./pages/Historial"
import Impresoras from "./pages/Impresoras"
import Toners from "./pages/Toners"
import Dependencias from "./pages/Dependencias"
import NuevoMovimientoDialog from "./components/NuevoMovimientoDialog"
import { categorias, articulos, movimientos, dependencias, oficinas, unidades, modelos } from "./data/mockData"
import { useState } from "react"
import { Add } from "@mui/icons-material"


function App() {
  const drawerWidth = 240;

  const [articulosState, setArticulosState] = useState(articulos)
  const [movimientosState, setMovimientosState] = useState(movimientos)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [unidadesState, setUnidadesState] = useState(unidades)
  const [modelosState, setModelosState] = useState(modelos)
  const [dependenciasState, setDependenciasState] = useState(dependencias)
  const [oficinasState, setOficinasState] = useState(oficinas)
  const [versionMovimiento, setVersionMovimiento] = useState(0)

  const menuItems = [
    {texto: 'Dashboard', ruta: '/'},
    {texto: 'Toners', ruta: '/toners'},
    {texto: 'Impresoras', ruta: '/impresoras'},
    {texto: 'Articulos', ruta: '/articulos'}  ,
    {texto: 'Dependencias', ruta: '/dependencias'},
    {texto: 'Historial', ruta: '/historial'}
  ]

  return(
      <>
      <BrowserRouter>
        <div style={{display:'flex'}}>
          <AppBar position="fixed" sx={{zIndex: 1201 }}>
            <Toolbar>
              <Typography variant="h6">Soporte Técnico - Stock</Typography>
            </Toolbar>
          </AppBar>

          <Drawer variant="permanent" sx={{width: drawerWidth, '& .MuiDrawer-paper': {width: drawerWidth} }}>
            <Toolbar/>
            <Box sx={{display:'flex', flexDirection:'column', flexGrow:1, justifyContent:"space-between"}}>
              <List>
                {menuItems.map((item) => (
                  <ListItemButton key={item.ruta} component={Link} to={item.ruta}>
                    <ListItemText primary={item.texto}/>
                  </ListItemButton>
                ))}
              </List>
              <IconButton variant="outlined" sx={{mt:'auto', m:2, width:'fit-content'}} color="primary" onClick={() => { setVersionMovimiento((v) => v + 1); setDialogoAbierto(true) }}>
                <Add sx={{width:'100%', height:'3em'}}/>
              </IconButton>
            </Box>
          </Drawer>
          <NuevoMovimientoDialog
            key={versionMovimiento}
            abierto={dialogoAbierto}
            onCerrar={() => setDialogoAbierto(false)}
            articulos={articulosState}
            setArticulos={setArticulosState}
            setMovimientos={setMovimientosState}
            oficinas={oficinasState}
          />
          <main style={{flexGrow:1, padding:24, marginTop:64}}>
            <Routes>
              <Route path="/" element={
                <Dashboard 
                articulos= {articulosState}/>}/>
              <Route path="/toners" element={
                <Toners
                articulos={articulosState}
                setArticulos={setArticulosState}
                categorias={categorias}
                unidades={unidadesState}
                modelos={modelosState}
                setModelos={setModelosState}
                />}/>
              <Route path="/impresoras" element={
                <Impresoras 
                modelos={modelosState} 
                setModelos={setModelosState}
                unidades={unidadesState}
                setUnidades={setUnidadesState}
                oficinas={oficinasState}
                articulos={articulosState} 
                categorias={categorias}
                />}/>
              <Route path="/articulos" element={
                <Articulos
                articulos={articulosState}
                setArticulos= {setArticulosState}
                categorias={categorias}
                />}/>
              <Route path="/dependencias" element={
                <Dependencias
                dependencias={dependenciasState}
                setDependencias={setDependenciasState}
                oficinas={oficinasState}
                setOficinas={setOficinasState}
                movimientos={movimientosState}
                modelos={modelosState}
                unidades={unidadesState}
                setUnidades={setUnidadesState}
                articulos={articulosState}
              />}/>
              <Route path="/historial" element={
                <Historial
                movimientos={movimientosState}
                articulos={articulosState}
                oficinas={oficinasState}
              />}/>
              <Route path="*" element={<h1>404 - No encontrado</h1>}/>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
