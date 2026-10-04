import { Button, AppBar, Toolbar, Typography, Drawer } from "@mui/material"


function App() {

  const drawerWidth = 240;

  return(
    <>
      <div style={{display:'flex'}}>
        <AppBar position="fixed" sx={{index: 1201 }}>
          <Toolbar>
            <Typography variant="h6">Soporte técnico - Stock</Typography>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" sx={{width: drawerWidth, '& .MuiDrawer-paper': {width: drawerWidth} }}>
          <Toolbar/>
          <p>Menú ( coso )</p>
        </Drawer>

        <main style={{flexGrow:1, padding:24, marginTop:64}}>
          <h1>Contenido </h1>
        </main>
      </div>
    </>
  )

}

export default App
