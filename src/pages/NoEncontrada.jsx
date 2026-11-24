import { Link } from 'react-router-dom'
import { useTitulo } from '../hooks/useTitulo'

export default function NoEncontrada() {
  useTitulo('Página no encontrada')
  return (
    <section className="portada">
      <h1>Página no encontrada</h1>
      <p>La dirección que abriste no existe en este sitio.</p>
      <Link to="/" className="boton">
        Volver al inicio
      </Link>
    </section>
  )
}
