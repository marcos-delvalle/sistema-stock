import {Dialog, DialogTitle, DialogContent, TextField, Button, MenuItem, Box, Autocomplete} from '@mui/material'
import {useState} from 'react'

function NuevoMovimientoDialog({abierto, onCerrar, articulos, setArticulos, setMovimientos}){
    const [articuloId, setArticuloId] = useState("")
    const [tipo, setTipo] = useState("salida")
    const [cantidad, setCantidad] = useState(1)
    const [destino, setDestino] = useState("")

    function registrar() {
    const articulo = articulos.find((a) => a.id === Number(articuloId))
    if (!articulo || cantidad <= 0) return

    const nuevoStock = tipo === 'entrada'
      ? articulo.stock_actual + Number(cantidad)
      : articulo.stock_actual - Number(cantidad)

    setArticulos(articulos.map((a) =>
      a.id === articulo.id ? { ...a, stock_actual: nuevoStock } : a
    ))

    setMovimientos((prev) => [...prev, {
      id: Date.now(),
      articulo_id: articulo.id,
      tipo,
      cantidad: Number(cantidad),
      destino,
      fecha: new Date().toISOString().slice(0, 10),
    }])

    onCerrar()
  }

    return(
        <>
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>Nuevo Movimiento</DialogTitle>
            <DialogContent>
                <Box sx={{display:'flex', flexDirection:'column', gap:2, mt:1, minWidth:300}}>
                    <Autocomplete
                        options={articulos}
                        getOptionLabel={(a) => a.nombre}
                        value={articulos.find((a) => a.id === Number(articuloId)) || null}
                        onChange={(e, nuevo) => setArticuloId(nuevo ? nuevo.id : '')}
                        renderInput={(params) => <TextField {...params} label="Artículo" />}
                    />
                    <Autocomplete
                        
                    />

                    <TextField select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                        <MenuItem value="entrada">Entrada</MenuItem>
                        <MenuItem value="salida">Salida</MenuItem>
                    </TextField>

                    <TextField
                        label="Cantidad"
                        type="number"
                        value={cantidad}
                        onChange={(e) => {
                            const v = Number(e.target.value)
                            setCantidad(v < 1 ? 1 : v)
                        }}
                    />
                    {/* <TextField
                        label="Destino"
                        value={destino}
                        onChange={(e) => setDestino(e.target.value)}
                    /> */}
                    <Button variant='contained' onClick={registrar}>Registrar</Button>
                </Box>
            </DialogContent>
        </Dialog>

        </>
    )
}
export default NuevoMovimientoDialog