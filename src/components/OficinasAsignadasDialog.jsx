import { Button, Dialog, DialogTitle, DialogContent, Box } from '@mui/material'
import {React, useState} from 'react'

function OficinasAsignadasDialog({abierto, onCerrar, unidades, modelo, setUnidades, oficinas}) {

    const [ubicacion, setUbicacion] = useState()
    const [direccionIp, setDireccionIp] = useState("")
    const [activo, setActivo] = useState(false)


  return (
    <>
    <Dialog open={abierto} onClose={onCerrar}>
        <DialogTitle>Titulo Dialog</DialogTitle>
        <DialogContent>
            <Box>
                {unidades
                    .filter((u) => u.modelo_id === modelo?.id)
                    .map((u) => {
                        const ofi = oficinas.find((o) => o.id === u.oficina_id)
                        return `${ofi?.nombre} — IP: ${u.ip} (${u.estado})`
                    })
                    .join(' · ')
                }
            </Box>
        </DialogContent>
    </Dialog>
    </>
  )
}

export default OficinasAsignadasDialog