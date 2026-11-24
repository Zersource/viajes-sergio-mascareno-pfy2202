import { Link } from 'react-router-dom'

// Muestra un error de la API y, si se puede, una forma de salir: reintentar o volver a los destinos.
export default function MensajeError({ titulo, mensaje, onReintentar, volverADestinos = false }) {
  return (
    <div className="error" role="alert">
      <h2>{titulo}</h2>
      <p>{mensaje}</p>
      <div className="acciones">
        {onReintentar && (
          <button type="button" className="boton" onClick={onReintentar}>
            Reintentar
          </button>
        )}
        {volverADestinos && (
          <Link to="/destinos" className="boton boton-claro">
            Ver todos los destinos
          </Link>
        )}
      </div>
    </div>
  )
}
