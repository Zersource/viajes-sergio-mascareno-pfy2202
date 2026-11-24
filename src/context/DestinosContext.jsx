import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { listarDestinos } from '../api/destinosApi'

const DestinosContext = createContext(null)

// Pide los destinos a la API REST una sola vez y los comparte con todas las paginas.
export function DestinosProvider({ children }) {
  const [destinos, setDestinos] = useState([])
  const [estado, setEstado] = useState('cargando') // 'cargando' | 'listo' | 'error'
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const control = new AbortController()
    setEstado('cargando')
    setError(null)
    listarDestinos({ signal: control.signal })
      .then((lista) => {
        setDestinos(lista)
        setEstado('listo')
      })
      .catch((falla) => {
        if (control.signal.aborted) return
        setError(falla)
        setEstado('error')
      })
    return () => control.abort()
  }, [intento])

  const reintentar = useCallback(() => setIntento((n) => n + 1), [])
  const valor = useMemo(() => ({ destinos, estado, error, reintentar }), [destinos, estado, error, reintentar])

  return <DestinosContext.Provider value={valor}>{children}</DestinosContext.Provider>
}

export function useDestinos() {
  const valor = useContext(DestinosContext)
  if (!valor) throw new Error('useDestinos debe usarse dentro de DestinosProvider')
  return valor
}
