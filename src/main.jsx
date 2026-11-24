import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './App.css'
import { BASE } from './config'

// No hay un servidor real: el backend (REST y GraphQL) es simulado con MSW, tambien en el sitio publicado.
// Se espera a que este listo antes de dibujar la aplicacion para que ningun pedido se escape.
async function activarServidorSimulado() {
  const { worker } = await import('./mocks/browser')
  return worker.start({
    serviceWorker: { url: `${BASE}mockServiceWorker.js` },
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}

function dibujar() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// Una recarga forzada (Ctrl+Shift+R), y en algunos navegadores tambien page.reload() de las pruebas, cargan la pagina
// sin Service Worker, y entonces el servidor simulado no intercepta nada. Si la pagina sigue sin control despues de
// esperar un instante, se recarga UNA vez de forma normal. La marca en sessionStorage evita que se repita en bucle.
const MARCA = 'viajes-recarga-por-service-worker'
const ESPERA_CONTROL_MS = 1500

// En la primera visita algunos navegadores (Firefox) demoran un momento en poner la pagina bajo control del Service Worker.
function esperarControl() {
  const sw = navigator.serviceWorker
  if (sw.controller) return Promise.resolve(true)
  return new Promise((resolve) => {
    const terminar = () => {
      clearTimeout(reloj)
      sw.removeEventListener('controllerchange', terminar)
      resolve(Boolean(sw.controller))
    }
    const reloj = setTimeout(terminar, ESPERA_CONTROL_MS)
    sw.addEventListener('controllerchange', terminar)
  })
}

function hayQueRecargar(controlado) {
  try {
    if (controlado) {
      sessionStorage.removeItem(MARCA)
      return false
    }
    if (sessionStorage.getItem(MARCA)) return false
    sessionStorage.setItem(MARCA, '1')
    return true
  } catch {
    return false
  }
}

async function alTerminarMock() {
  if (!navigator.serviceWorker) return dibujar()
  const controlado = await esperarControl()
  if (hayQueRecargar(controlado)) window.location.reload()
  else dibujar()
}

// Si el servidor simulado no logra iniciar (por ejemplo, un navegador que bloquea Service Workers),
// la aplicacion igual se dibuja y muestra sus mensajes de error en lugar de quedar en blanco.
activarServidorSimulado().then(alTerminarMock, (error) => {
  console.warn('No se pudo iniciar el servidor simulado (MSW):', error)
  dibujar()
})
