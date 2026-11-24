import Disponibilidad from './Disponibilidad'
import { UNIDAD_ASIENTOS, estadoDisponibilidad, formatearFecha, formatearPrecio } from '../utils/formato'

export default function TarjetaVuelo({ vuelo, destino }) {
  const estado = estadoDisponibilidad(vuelo.asientosDisponibles, UNIDAD_ASIENTOS)
  return (
    <li className={`tarjeta opcion${vuelo.asientosDisponibles === 0 ? ' opcion-agotada' : ''}`}>
      <div className="opcion-datos">
        <h3>{vuelo.aerolinea}</h3>
        <p className="ruta">
          {vuelo.origen} → {destino.nombre}
        </p>
        <dl className="fechas">
          <div>
            <dt>Salida</dt>
            <dd>{formatearFecha(vuelo.fechaSalida)}</dd>
          </div>
          <div>
            <dt>Regreso</dt>
            <dd>{formatearFecha(vuelo.fechaRegreso)}</dd>
          </div>
        </dl>
      </div>
      <div className="opcion-precio">
        <p className="precio">{formatearPrecio(vuelo.precio)}</p>
        <p className="precio-nota">por persona, ida y vuelta</p>
        <Disponibilidad estado={estado} />
      </div>
    </li>
  )
}
