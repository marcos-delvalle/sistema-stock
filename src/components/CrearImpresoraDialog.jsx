import { Button, Dialog, DialogTitle, DialogContent, Box, TextField, Autocomplete, DialogActions } from '@mui/material'
import {React, useState} from 'react'
import { articulos } from '../data/mockData'

function CrearImpresoraDialog({abierto, onCerrar, articulos, modelos, setModelos}) {

    const [marca, setMarca] = useState("")
    const [nombreModelo, setNombreModelo] = useState("")
    const [tonerId, setTonerId ] = useState("")

    function crear(){
        const existe = modelos.some((m) => 
            m.marca.toLowerCase() === marca.toLowerCase() &&
            m.modelo.toLowerCase() === nombreModelo.toLowerCase()
        )
        if (existe || !marca || !nombreModelo || !tonerId) {
            alert('Revisá los datos: el modelo ya existe o faltan campos')
            return
        }

        setModelos((prev) => [...prev, {
            id: Date.now(),
            marca,
            modelo:nombreModelo,
            articulo_id:Number(tonerId)
        }])

        setMarca("")
        setNombreModelo("")
        setTonerId("")
        onCerrar()
    }

  return (
    <>
    <Dialog open={abierto} onClose={onCerrar}>
        <DialogTitle>Crear Nueva Impresora</DialogTitle>
        <DialogContent>
            <Box sx={{display:'flex', flexDirection:'column', gap:2, mt:1, minWidth:300}}>
                <TextField label='Marca' value={marca} onChange={(e) => setMarca(e.target.value)}></TextField>
                <TextField label='Modelo' value={nombreModelo} onChange={(e) => setNombreModelo(e.target.value)}></TextField>
                <Autocomplete 
                options={articulos}
                getOptionLabel={(a) => a.nombre}
                value={articulos.find((a) => a.id === Number(tonerId)) || null}
                onChange={(e, nuevo) => setTonerId(nuevo ? nuevo.id : '')}
                renderInput={(params) => <TextField {...params} label='Tóner compatible'/>}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCerrar}>Cancelar</Button>
            <Button variant='contained' onClick={crear}>Crear</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default CrearImpresoraDialog