import { Box, Typography } from '@mui/material'

/**
 * Encabezado común de las páginas.
 * En celular apila el título y las acciones; en escritorio los pone en fila.
 */
function EncabezadoPagina({ titulo, subtitulo, acciones, mb = 2 }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
                mb,
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="h4"
                    sx={{ fontSize: { xs: '1.6rem', sm: '2.125rem' }, lineHeight: 1.2 }}
                >
                    {titulo}
                </Typography>
                {subtitulo && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitulo}
                    </Typography>
                )}
            </Box>

            {acciones && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 1,
                        width: { xs: '100%', sm: 'auto' },
                        '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
                    }}
                >
                    {acciones}
                </Box>
            )}
        </Box>
    )
}

export default EncabezadoPagina
