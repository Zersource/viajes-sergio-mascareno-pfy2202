import Disponibilidad from './Disponibilidad'
import Estrellas from './Estrellas'
import { UNIDAD_HABITACIONES, estadoDisponibilidad, formatearFecha, formatearPrecio } from '../utils/formato'

export default function TarjetaHotel({ hotel }) {
  const estado = estadoDisponibilidad(hotel.habitacionesDisponibles, UNIDAD_HABITACIONES)
  return (
    <li className={`tarjeta opcion${hotel.habitacionesDisponibles === 0 ? ' opcion-agotada' : ''}`}>
      <div className="opcion-datos">
        <h3>{hotel.nombre}</h3>
        <Estrellas cantidad={hotel.estrellas} />
        <dl className="fechas">
          <div>
            <dt>Disponible desde</dt>
            <dd>{formatearFecha(hotel.fechaDesde)}</dd>
          </div>
          <div>
            <dt>Hasta</dt>
            <dd>{formatearFecha(hotel.fechaHasta)}</dd>
          </div>
        </dl>
      </div>
      <div className="opcion-precio">
        <p className="precio">{formatearPrecio(hotel.precioPorNoche)}</p>
        <p className="precio-nota">por noche</p>
        <Disponibilidad estado={estado} />
      </div>
    </li>
  )
}
