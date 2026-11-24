import Cargando from '../components/Cargando'
import MensajeError from '../components/MensajeError'
import TarjetaDestino from '../components/TarjetaDestino'
import { useDestinos } from '../context/DestinosContext'
import { useTitulo } from '../hooks/useTitulo'

const TONOS = [18, 190, 150, 35, 345, 265]

export default function Destinos() {
  useTitulo('Destinos')
  const { destinos, estado, error, reintentar } = useDestinos()

  return (
    <>
      <h1>Destinos disponibles</h1>
      <p className="bajada">Selecciona un destino para ver sus vuelos y hoteles.</p>

      {estado === 'cargando' && <Cargando mensaje="Cargando destinos..." />}
      {estado === 'error' && <MensajeError titulo="No pudimos cargar los destinos" mensaje={error.message} onReintentar={reintentar} />}
      {estado === 'listo' && (
        <ul className="grilla">
          {destinos.map((destino, i) => (
            <TarjetaDestino key={destino.id} destino={destino} tono={TONOS[i % TONOS.length]} />
          ))}
        </ul>
      )}
    </>
  )
}
