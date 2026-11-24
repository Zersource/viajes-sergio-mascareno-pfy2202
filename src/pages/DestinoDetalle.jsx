import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { OPCIONES_DE_VIAJE } from '../api/graphql'
import Cargando from '../components/Cargando'
import MensajeError from '../components/MensajeError'
import SeccionOpciones from '../components/SeccionOpciones'
import TarjetaHotel from '../components/TarjetaHotel'
import TarjetaVuelo from '../components/TarjetaVuelo'
import { useDestinos } from '../context/DestinosContext'
import { useTitulo } from '../hooks/useTitulo'

// Mensaje para la persona a partir de un error de Apollo (de red o devuelto por la API GraphQL)
function mensajeDeError(error) {
  if (error.graphQLErrors?.length) return error.graphQLErrors[0].message
  if (error.networkError) return 'No se pudo conectar con el servidor de vuelos y hoteles. Intenta de nuevo.'
  return 'Ocurrió un problema al consultar los vuelos y hoteles.'
}

// Vuelos y hoteles del destino: se piden a la API GraphQL con useQuery
function OpcionesDeViaje({ destino }) {
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const { data, loading, error, refetch } = useQuery(OPCIONES_DE_VIAJE, {
    variables: { destinoId: destino.id },
    notifyOnNetworkStatusChange: true,
  })

  if (loading) return <Cargando mensaje={`Buscando vuelos y hoteles en ${destino.nombre}...`} />
  if (error) {
    return <MensajeError titulo="No pudimos cargar las opciones" mensaje={mensajeDeError(error)} onReintentar={() => refetch()} volverADestinos />
  }

  const vuelos = soloDisponibles ? data.vuelos.filter((v) => v.asientosDisponibles > 0) : data.vuelos
  const hoteles = soloDisponibles ? data.hoteles.filter((h) => h.habitacionesDisponibles > 0) : data.hoteles

  return (
    <>
      <div className="filtro">
        <label>
          <input type="checkbox" checked={soloDisponibles} onChange={(e) => setSoloDisponibles(e.target.checked)} /> Mostrar solo opciones con disponibilidad
        </label>
      </div>
      <SeccionOpciones id="vuelos" titulo="Vuelos" cantidad={vuelos.length} vacio="No hay vuelos que cumplan el filtro.">
        {vuelos.map((vuelo) => (
          <TarjetaVuelo key={vuelo.id} vuelo={vuelo} destino={destino} />
        ))}
      </SeccionOpciones>
      <SeccionOpciones id="hoteles" titulo="Hoteles" cantidad={hoteles.length} vacio="No hay hoteles que cumplan el filtro.">
        {hoteles.map((hotel) => (
          <TarjetaHotel key={hotel.id} hotel={hotel} />
        ))}
      </SeccionOpciones>
    </>
  )
}

export default function DestinoDetalle() {
  const { destinoId } = useParams()
  const { destinos, estado, error, reintentar } = useDestinos()
  const destino = destinos.find((d) => d.id === destinoId)
  useTitulo(destino ? destino.nombre : 'Destino')

  if (estado === 'cargando') return <Cargando mensaje="Cargando destino..." />
  if (estado === 'error') return <MensajeError titulo="No pudimos cargar el destino" mensaje={error.message} onReintentar={reintentar} volverADestinos />
  if (!destino) {
    return <MensajeError titulo="Destino no encontrado" mensaje={`No tenemos un destino llamado "${destinoId}".`} volverADestinos />
  }

  return (
    <>
      <p>
        <Link to="/destinos">← Todos los destinos</Link>
      </p>
      <header className="destino-cabecera">
        <h1>{destino.nombre}</h1>
        <p className="pais">{destino.pais}</p>
        <p>{destino.descripcion}</p>
        <h2 className="subtitulo">Actividades populares</h2>
        <ul className="etiquetas">
          {destino.actividades.map((actividad) => (
            <li key={actividad}>{actividad}</li>
          ))}
        </ul>
      </header>
      <OpcionesDeViaje key={destino.id} destino={destino} />
    </>
  )
}
