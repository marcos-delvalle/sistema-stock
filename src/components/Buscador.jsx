import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Clear, Search } from '@mui/icons-material'

/**
 * Campo de búsqueda con lupa y botón para limpiar.
 * El filtrado lo hace cada página con `normalizar` (sin distinguir acentos ni mayúsculas).
 */
function Buscador({ valor, onChange, placeholder = 'Buscar...', sx }) {
    const estilos = [
        { minWidth: { xs: '100%', sm: 260 }, maxWidth: 420, flexGrow: 1 },
        ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
    ]

    return (
        <TextField
            size="small"
            placeholder={placeholder}
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            sx={estilos}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search fontSize="small" />
                        </InputAdornment>
                    ),
                    endAdornment: valor ? (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                aria-label="Limpiar búsqueda"
                                onClick={() => onChange('')}
                            >
                                <Clear fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ) : null,
                },
            }}
        />
    )
}

export default Buscador
