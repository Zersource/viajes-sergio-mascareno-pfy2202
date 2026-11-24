import { BASE } from '../config.js'

// Error de la API con un mensaje pensado para mostrarselo a la persona.
export class ErrorApi extends Error {
  constructor(mensaje, { tipo = 'desconocido', estado = null } = {}) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.tipo = tipo
    this.estado = estado
  }
}

const TIEMPO_MAXIMO_MS = 8000

// Cliente REST: GET <base>api/destinos
export async function listarDestinos({ base = BASE, signal } = {}) {
  const control = new AbortController()
  const alAbortar = () => control.abort()
  signal?.addEventListener('abort', alAbortar)
  const reloj = setTimeout(() => control.abort('tiempo'), TIEMPO_MAXIMO_MS)

  try {
    let respuesta
    try {
      respuesta = await fetch(`${base}api/destinos`, { signal: control.signal })
    } catch (error) {
      if (signal?.aborted) throw error // la pantalla ya no necesita la respuesta
      if (control.signal.aborted) throw new ErrorApi('El servidor tardó demasiado en responder.', { tipo: 'tiempo' })
      throw new ErrorApi('No se pudo conectar con el servidor. Revisa tu conexión.', { tipo: 'red' })
    }

    if (!respuesta.ok) {
      const mensaje = respuesta.status >= 500 ? 'El servidor tuvo un problema. Intenta de nuevo.' : 'No se encontraron los destinos.'
      throw new ErrorApi(mensaje, { tipo: 'http', estado: respuesta.status })
    }

    try {
      const datos = await respuesta.json()
      if (!Array.isArray(datos)) throw new Error('formato')
      return datos
    } catch {
      throw new ErrorApi('La respuesta del servidor no se pudo leer.', { tipo: 'formato' })
    }
  } finally {
    clearTimeout(reloj)
    signal?.removeEventListener('abort', alAbortar)
  }
}
