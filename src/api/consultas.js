// Texto de las consultas GraphQL. Una sola consulta trae los vuelos y los hoteles del destino elegido,
// pidiendo solo los campos que las pantallas usan.
export const TEXTO_OPCIONES_DE_VIAJE = `
  query OpcionesDeViaje($destinoId: ID!) {
    vuelos(destinoId: $destinoId) {
      id
      aerolinea
      origen
      fechaSalida
      fechaRegreso
      precio
      asientosDisponibles
    }
    hoteles(destinoId: $destinoId) {
      id
      nombre
      estrellas
      precioPorNoche
      fechaDesde
      fechaHasta
      habitacionesDisponibles
    }
  }
`
