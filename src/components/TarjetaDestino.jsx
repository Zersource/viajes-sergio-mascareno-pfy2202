import { Link } from 'react-router-dom'

export default function TarjetaDestino({ destino, tono }) {
  return (
    <li className="tarjeta tarjeta-destino" style={{ '--tono': tono }}>
      <div className="tarjeta-banda">
        <span>{destino.pais}</span>
      </div>
      <div className="tarjeta-cuerpo">
        <h2>{destino.nombre}</h2>
        <p>{destino.descripcion}</p>
        <h3 className="subtitulo">Actividades populares</h3>
        <ul className="lista-simple">
          {destino.actividades.map((actividad) => (
            <li key={actividad}>{actividad}</li>
          ))}
        </ul>
        <Link to={`/destinos/${destino.id}`} className="boton" aria-label={`Ver vuelos y hoteles de ${destino.nombre}`}>
          Ver vuelos y hoteles
        </Link>
      </div>
    </li>
  )
}
