import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(true)

    // Al abrir la app, preguntamos si la cookie de sesión sigue vigente.
    useEffect(() => {
        let vivo = true

        api.get('/auth/me')
            .then((datos) => {
                if (vivo) setUsuario(datos?.usuario || null)
            })
            .catch(() => {
                if (vivo) setUsuario(null)
            })
            .finally(() => {
                if (vivo) setCargando(false)
            })

        return () => {
            vivo = false
        }
    }, [])

    const ingresar = useCallback(async (nombreUsuario, password) => {
        const datos = await api.post('/auth/login', {
            usuario: nombreUsuario,
            password,
        })

        setUsuario(datos.usuario)
    }, [])

    const salir = useCallback(async () => {
        try {
            await api.post('/auth/logout')
        } catch {
            // Si la sesión ya expiró, igual cerramos en el cliente.
        }

        setUsuario(null)
    }, [])

    const valor = useMemo(() => ({
        usuario,
        cargando,
        ingresar,
        salir,
    }), [usuario, cargando, ingresar, salir])

    return (
        <AuthContext.Provider value={valor}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const contexto = useContext(AuthContext)

    if (!contexto) {
        throw new Error('useAuth debe usarse dentro de AuthProvider')
    }

    return contexto
}
