import {BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText } from "@mui/material"


function App() {

  const drawerWidth = 240;

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
          <AppBar position="fixed" sx={{index: 1201 }}>
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
              <Route path="/" element={<h1>Dashboard</h1>}/>
              <Route path="/impresoras" element={<h1>Impresoras</h1>}/>
              <Route path="/articulos" element={<h1>Artículos</h1>}/>
              <Route path="/historial" element={<h1>Historial</h1>}/>
              <Route path="*" element={<h1>404 - No encontrado</h1>}/>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
