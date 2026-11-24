import { Link } from 'react-router-dom'
import { useTitulo } from '../hooks/useTitulo'

export default function Inicio() {
  useTitulo('')
  return (
    <>
      <section className="portada">
        <h1>Planifica tu próximo viaje</h1>
        <p>Elige un destino y revisa los vuelos y hoteles disponibles, con precios, fechas y cupos.</p>
        <Link to="/destinos" className="boton boton-grande">
          Explorar destinos
        </Link>
      </section>
      <section aria-labelledby="como-funciona">
        <h2 id="como-funciona">Cómo funciona</h2>
        <ol className="pasos">
          <li>
            <strong>Explora los destinos.</strong> Cada uno muestra su país y las actividades más populares.
          </li>
          <li>
            <strong>Selecciona uno.</strong> Te llevamos a su página con todas las opciones.
          </li>
          <li>
            <strong>Compara vuelos y hoteles.</strong> Precios, fechas y disponibilidad en una sola pantalla.
          </li>
        </ol>
      </section>
    </>
  )
}
