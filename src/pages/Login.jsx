import {
    Alert, Avatar, Box, Button, CircularProgress, Paper, TextField, Typography,
} from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Login() {
    const { ingresar } = useAuth()
    const [usuario, setUsuario] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)

    async function enviar(evento) {
        evento.preventDefault()

        if (!usuario.trim() || !password) {
            setError('Completá usuario y contraseña.')
            return
        }

        setEnviando(true)
        setError('')

        try {
            await ingresar(usuario.trim(), password)
        } catch (e) {
            setError(e.message)
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'grey.100',
                p: 2,
            }}
        >
            <Paper
                component="form"
                onSubmit={enviar}
                elevation={4}
                sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3 }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mb: 1.5 }}>
                        <LockOutlined />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Soporte Técnico
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gestión de stock
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Usuario"
                        value={usuario}
                        onChange={(e) => { setUsuario(e.target.value); setError('') }}
                        autoFocus
                        autoComplete="username"
                    />

                    <TextField
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError('') }}
                        autoComplete="current-password"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={enviando}
                        startIcon={enviando ? <CircularProgress size={18} color="inherit" /> : null}
                    >
                        {enviando ? 'Ingresando...' : 'Ingresar'}
                    </Button>
                </Box>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 3, textAlign: 'center' }}
                >
                    Usuario único de administrador
                </Typography>
            </Paper>
        </Box>
    )
}

export default Login
