import { Box, Typography } from '@mui/material'

function Dependencias({dependencias, oficinas, unidades, modelos, movimientos}) {

    return (
    <>
    <h1>Dependencias</h1>
    {dependencias.map((dep) => (
        <Box key={dep.id}>
            <Typography variant='h5'>{dep.nombre}</Typography>
            {oficinas
            .filter((o) => o.dependencia_id === dep.id)
            .map((oficina) => (
                <Box key={oficina.id}>
                    <Typography variant='h6'>{oficina.nombre}</Typography>
                    <Typography variant='body2'>
                        Unidades: {
                            unidades
                                .filter((u) => u.oficina_id === oficina.id)
                                .map((u) => {
                                    const modelo = modelos.find((m) => m.id === u.modelo_id)
                                    return `${modelo?.marca} ${modelo?.modelo} - IP: ${u.ip} (${u.estado})`
                                })
                                .join(', ')
                        }
                    </Typography>
                    <Typography>
                        Movimientos: {movimientos.filter((m) => m.oficina_id === oficina.id).lenght}
                    </Typography>
                    <Typography>
                        
                    </Typography>
                </Box>
            ))}
        </Box>
    ))}
    </> 
    )
}

export default Dependencias