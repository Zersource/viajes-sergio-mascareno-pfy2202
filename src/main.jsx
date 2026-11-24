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

// Si el servidor simulado no logra iniciar (por ejemplo, un navegador que bloquea Service Workers),
// la aplicacion igual se dibuja y muestra sus mensajes de error en lugar de quedar en blanco.
activarServidorSimulado()
  .catch((error) => console.warn('No se pudo iniciar el servidor simulado (MSW):', error))
  .then(dibujar)
