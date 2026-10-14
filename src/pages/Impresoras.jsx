import {Box, Card, CardContent, Typography , Button} from '@mui/material'
import OficinasAsignadasDialog from '../components/OficinasAsignadasDialog'
import CrearImpresoraDialog from '../components/CrearImpresoraDialog'
import { useState } from 'react'

function Impresoras({modelos, unidades, oficinas, articulos, setModelos, setUnidades}){

    const [dialogoCrear, setDialogoCrear] = useState(false)
    const [modeloSeleccionado, setModeloSeleccionado] = useState(null)

    return(
        <>
        <h1>Impresoras</h1>
        <Button variant='contained' onClick={() => setDialogoCrear(true)}>Crear Impresora</Button>
        <CrearImpresoraDialog 
        abierto={dialogoCrear}
        onCerrar={()=>setDialogoCrear(false)} 
        modelos={modelos}       
        setModelos={setModelos}
        articulos={articulos}
        />
        <Box sx={{display:'flex', flexWrap:'wrap', gap:2}}>
            {modelos.map((m) => (
                <Card key={m.id} sx={{minWidth: 220, cursor:'pointer'}} onClick={() => setModeloSeleccionado(m)}>
                    <CardContent>
                        <Typography variant='h6'>{m.marca} {m.modelo}</Typography>
                        <Typography variant='body2'>
                            Toner: {articulos.find((a) => a.id === m.articulo_id)?.nombre}
                        </Typography>
                        <Typography variant='body2'>
                            Asignadas: {unidades.filter((u) => u.modelo_id === m.id).length}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
        <OficinasAsignadasDialog
            abierto={modeloSeleccionado !== null}
            onCerrar={() => setModeloSeleccionado(null)}
            modelo={modeloSeleccionado}
            unidades={unidades}
            oficinas={oficinas}
            setUnidades={setUnidades}
        />
        </>
    )
}
export default Impresoras