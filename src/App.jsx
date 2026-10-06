import {BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText } from "@mui/material"
import Articulos from './pages/Articulos'
import Dashboard from './pages/Dashboard'
import Historial from "./pages/Historial"
import { articulos, movimientos } from "./data/mockData"
import { useState } from "react"


function App() {
  const drawerWidth = 240;

  const [articulosState, setArticulosState] = useState(articulos)
  const [movimientosState, setMovimientosState] = useState(movimientos)

  const menuItems = [
    {texto: 'Dashboard', ruta: '/'},
    {texto: 'Articulos', ruta: '/articulos'},
    {texto: 'Impresoras', ruta: '/impresoras'},
    {texto: 'Historial', ruta: '/historial'}
  ]

  return(
      <>
      <BrowserRouter>
        <div style={{display:'flex'}}>
          <AppBar position="fixed" sx={{zIndex: 1201 }}>
            <Toolbar>
              <Typography variant="h6">Soporte técnico - Stock</Typography>
            </Toolbar>
          </AppBar>

          <Drawer variant="permanent" sx={{width: drawerWidth, '& .MuiDrawer-paper': {width: drawerWidth} }}>
            <Toolbar/>
            <List>
              {menuItems.map((item) => (
                <ListItemButton key={item.ruta} component={Link} to={item.ruta}>
                  <ListItemText primary={item.texto}/>
                </ListItemButton>
              ))}
            </List>
          </Drawer>

          <main style={{flexGrow:1, padding:24, marginTop:64}}>
            <Routes>
              <Route path="/" element={<Dashboard articulos= {articulosState}/>}/>
              <Route path="/impresoras" element={<h1>Impresoras</h1>}/>
              <Route path="/articulos" element={<Articulos articulos={articulosState}
              setArticulos= {setArticulosState}/>}/>
              <Route path="/historial" element={<Historial movimientos={movimientosState} articulos={articulosState}
              setMovimientos={setMovimientosState}/>}/>
              <Route path="*" element={<h1>404 - No encontrado</h1>}/>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
