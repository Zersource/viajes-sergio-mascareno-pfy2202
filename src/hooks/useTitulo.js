import { useEffect } from 'react'

// Cambia el titulo de la pestana segun la pagina
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | Viajes Rumbo Sur` : 'Viajes Rumbo Sur'
  }, [titulo])
}
