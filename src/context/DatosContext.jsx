import {
    createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

const DatosContext = createContext(null)

const DATOS_VACIOS = {
    categorias: [],
    articulos: [],
    modelos: [],
    unidades: [],
    dependencias: [],
    oficinas: [],
    movimientos: [],
}

export function DatosProvider({ children }) {
    const { salir } = useAuth()
    const [datos, setDatos] = useState(DATOS_VACIOS)
    const [cargando, setCargando] = useState(true)
    const [recargando, setRecargando] = useState(false)
    const [error, setError] = useState('')
    const [aviso, setAviso] = useState(null)

    const notificar = useCallback((mensaje, severidad = 'success') => {
        setAviso({ mensaje, severidad, id: Date.now() })
    }, [])

    const cerrarAviso = useCallback(() => setAviso(null), [])

    const recargar = useCallback(async ({ inicial = false } = {}) => {
        if (inicial) setCargando(true)
        else setRecargando(true)

        try {
            const [
                categorias,
                articulos,
                modelos,
                unidades,
                dependencias,
                oficinas,
                movimientos,
            ] = await Promise.all([
                api.get('/categorias'),
                api.get('/articulos'),
                api.get('/modelos'),
                api.get('/unidades'),
                api.get('/dependencias'),
                api.get('/oficinas'),
                api.get('/movimientos'),
            ])

            setDatos({
                categorias,
                articulos,
                modelos,
                unidades,
                dependencias,
                oficinas,
                movimientos,
            })
            setError('')
        } catch (e) {
            if (e.estado === 401) {
                await salir()
                return
            }

            if (inicial) {
                setError(e.message)
            } else {
                notificar(e.message, 'error')
            }
        } finally {
            setCargando(false)
            setRecargando(false)
        }
    }, [salir, notificar])

    useEffect(() => {
        recargar({ inicial: true })
    }, [recargar])

    const valor = useMemo(() => ({
        ...datos,
        cargando,
        recargando,
        error,
        recargar,
        aviso,
        notificar,
        cerrarAviso,
    }), [
        datos, cargando, recargando, error, recargar, aviso, notificar, cerrarAviso,
    ])

    return (
        <DatosContext.Provider value={valor}>
            {children}
        </DatosContext.Provider>
    )
}

export function useDatos() {
    const contexto = useContext(DatosContext)

    if (!contexto) {
        throw new Error('useDatos debe usarse dentro de DatosProvider')
    }

    return contexto
}
