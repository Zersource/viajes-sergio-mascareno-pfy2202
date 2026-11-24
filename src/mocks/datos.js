// Datos de ejemplo del backend simulado. Nada de esto vive en los componentes: llega por REST y GraphQL.

// Destinos que entrega la API REST (pais y actividades populares)
export const destinos = [
  {
    id: 'cusco',
    nombre: 'Cusco',
    pais: 'Perú',
    descripcion: 'Antigua capital del imperio inca, rodeada de montañas y ruinas.',
    actividades: ['Visitar Machu Picchu', 'Recorrer el Valle Sagrado', 'Caminar por la Plaza de Armas'],
  },
  {
    id: 'rio-de-janeiro',
    nombre: 'Río de Janeiro',
    pais: 'Brasil',
    descripcion: 'Playas famosas entre el mar y los cerros.',
    actividades: ['Subir al Cristo Redentor', 'Pasear por Copacabana', 'Tomar el teleférico al Pan de Azúcar'],
  },
  {
    id: 'buenos-aires',
    nombre: 'Buenos Aires',
    pais: 'Argentina',
    descripcion: 'Ciudad de barrios con mucha vida cultural y gastronómica.',
    actividades: ['Ver un espectáculo de tango', 'Visitar el barrio de La Boca', 'Probar un asado'],
  },
  {
    id: 'cartagena',
    nombre: 'Cartagena de Indias',
    pais: 'Colombia',
    descripcion: 'Ciudad amurallada frente al Caribe.',
    actividades: ['Caminar por el centro amurallado', 'Visitar las Islas del Rosario', 'Conocer el Castillo San Felipe'],
  },
  {
    id: 'madrid',
    nombre: 'Madrid',
    pais: 'España',
    descripcion: 'Capital española de museos, parques y vida nocturna.',
    actividades: ['Recorrer el Museo del Prado', 'Pasear por el Parque del Retiro', 'Ir de tapas por La Latina'],
  },
  {
    id: 'roma',
    nombre: 'Roma',
    pais: 'Italia',
    descripcion: 'Ciudad con más de dos mil años de historia a cada paso.',
    actividades: ['Entrar al Coliseo', 'Lanzar una moneda en la Fontana di Trevi', 'Visitar el Vaticano'],
  },
]

// Vuelos y hoteles por destino, que entrega la API GraphQL.
// Todos los vuelos salen desde Santiago. asientosDisponibles / habitacionesDisponibles en 0 significa "agotado".
export const opcionesPorDestino = {
  cusco: {
    vuelos: [
      { id: 'v-cus-1', aerolinea: 'Andes Air', origen: 'Santiago', fechaSalida: '2027-02-10', fechaRegreso: '2027-02-17', precio: 289000, asientosDisponibles: 14 },
      { id: 'v-cus-2', aerolinea: 'Cóndor Líneas', origen: 'Santiago', fechaSalida: '2027-02-24', fechaRegreso: '2027-03-03', precio: 315000, asientosDisponibles: 3 },
      { id: 'v-cus-3', aerolinea: 'Pacífico Jet', origen: 'Santiago', fechaSalida: '2027-03-12', fechaRegreso: '2027-03-19', precio: 342000, asientosDisponibles: 0 },
    ],
    hoteles: [
      { id: 'h-cus-1', nombre: 'Hotel Plaza Inca', estrellas: 4, precioPorNoche: 78000, fechaDesde: '2027-02-10', fechaHasta: '2027-03-19', habitacionesDisponibles: 9 },
      { id: 'h-cus-2', nombre: 'Casa del Valle', estrellas: 3, precioPorNoche: 46000, fechaDesde: '2027-02-10', fechaHasta: '2027-03-05', habitacionesDisponibles: 2 },
      { id: 'h-cus-3', nombre: 'Posada Qosqo', estrellas: 2, precioPorNoche: 29000, fechaDesde: '2027-03-01', fechaHasta: '2027-03-19', habitacionesDisponibles: 0 },
    ],
  },
  'rio-de-janeiro': {
    vuelos: [
      { id: 'v-rio-1', aerolinea: 'Pacífico Jet', origen: 'Santiago', fechaSalida: '2027-02-05', fechaRegreso: '2027-02-15', precio: 398000, asientosDisponibles: 21 },
      { id: 'v-rio-2', aerolinea: 'Andes Air', origen: 'Santiago', fechaSalida: '2027-02-19', fechaRegreso: '2027-03-01', precio: 421000, asientosDisponibles: 5 },
      { id: 'v-rio-3', aerolinea: 'Cóndor Líneas', origen: 'Santiago', fechaSalida: '2027-03-06', fechaRegreso: '2027-03-16', precio: 376000, asientosDisponibles: 12 },
    ],
    hoteles: [
      { id: 'h-rio-1', nombre: 'Copa Mar Hotel', estrellas: 5, precioPorNoche: 135000, fechaDesde: '2027-02-05', fechaHasta: '2027-03-16', habitacionesDisponibles: 4 },
      { id: 'h-rio-2', nombre: 'Ipanema Suites', estrellas: 4, precioPorNoche: 96000, fechaDesde: '2027-02-05', fechaHasta: '2027-03-16', habitacionesDisponibles: 11 },
      { id: 'h-rio-3', nombre: 'Hostal Lapa', estrellas: 2, precioPorNoche: 31000, fechaDesde: '2027-02-12', fechaHasta: '2027-03-10', habitacionesDisponibles: 18 },
    ],
  },
  'buenos-aires': {
    vuelos: [
      { id: 'v-bue-1', aerolinea: 'Cóndor Líneas', origen: 'Santiago', fechaSalida: '2027-02-03', fechaRegreso: '2027-02-08', precio: 154000, asientosDisponibles: 30 },
      { id: 'v-bue-2', aerolinea: 'Andes Air', origen: 'Santiago', fechaSalida: '2027-02-17', fechaRegreso: '2027-02-24', precio: 171000, asientosDisponibles: 8 },
      { id: 'v-bue-3', aerolinea: 'Pacífico Jet', origen: 'Santiago', fechaSalida: '2027-03-10', fechaRegreso: '2027-03-14', precio: 149000, asientosDisponibles: 1 },
      { id: 'v-bue-4', aerolinea: 'Andes Air', origen: 'Santiago', fechaSalida: '2027-03-24', fechaRegreso: '2027-03-30', precio: 165000, asientosDisponibles: 0 },
    ],
    hoteles: [
      { id: 'h-bue-1', nombre: 'Hotel Palermo Viejo', estrellas: 4, precioPorNoche: 72000, fechaDesde: '2027-02-03', fechaHasta: '2027-03-30', habitacionesDisponibles: 7 },
      { id: 'h-bue-2', nombre: 'Casa San Telmo', estrellas: 3, precioPorNoche: 41000, fechaDesde: '2027-02-03', fechaHasta: '2027-03-30', habitacionesDisponibles: 3 },
    ],
  },
  cartagena: {
    vuelos: [
      { id: 'v-car-1', aerolinea: 'Pacífico Jet', origen: 'Santiago', fechaSalida: '2027-02-14', fechaRegreso: '2027-02-21', precio: 462000, asientosDisponibles: 9 },
      { id: 'v-car-2', aerolinea: 'Andes Air', origen: 'Santiago', fechaSalida: '2027-03-07', fechaRegreso: '2027-03-14', precio: 489000, asientosDisponibles: 2 },
    ],
    hoteles: [
      { id: 'h-car-1', nombre: 'Hotel Muralla Real', estrellas: 5, precioPorNoche: 148000, fechaDesde: '2027-02-14', fechaHasta: '2027-03-14', habitacionesDisponibles: 5 },
      { id: 'h-car-2', nombre: 'Casa Getsemaní', estrellas: 3, precioPorNoche: 62000, fechaDesde: '2027-02-14', fechaHasta: '2027-03-14', habitacionesDisponibles: 12 },
      { id: 'h-car-3', nombre: 'Posada del Puerto', estrellas: 2, precioPorNoche: 38000, fechaDesde: '2027-02-14', fechaHasta: '2027-03-14', habitacionesDisponibles: 0 },
    ],
  },
  madrid: {
    vuelos: [
      { id: 'v-mad-1', aerolinea: 'Cóndor Líneas', origen: 'Santiago', fechaSalida: '2027-04-02', fechaRegreso: '2027-04-16', precio: 845000, asientosDisponibles: 16 },
      { id: 'v-mad-2', aerolinea: 'Pacífico Jet', origen: 'Santiago', fechaSalida: '2027-04-23', fechaRegreso: '2027-05-07', precio: 912000, asientosDisponibles: 4 },
      { id: 'v-mad-3', aerolinea: 'Andes Air', origen: 'Santiago', fechaSalida: '2027-05-14', fechaRegreso: '2027-05-28', precio: 879000, asientosDisponibles: 0 },
    ],
    hoteles: [
      { id: 'h-mad-1', nombre: 'Gran Vía Palace', estrellas: 5, precioPorNoche: 158000, fechaDesde: '2027-04-02', fechaHasta: '2027-05-28', habitacionesDisponibles: 6 },
      { id: 'h-mad-2', nombre: 'Hotel Retiro', estrellas: 4, precioPorNoche: 97000, fechaDesde: '2027-04-02', fechaHasta: '2027-05-28', habitacionesDisponibles: 14 },
      { id: 'h-mad-3', nombre: 'Pensión La Latina', estrellas: 2, precioPorNoche: 44000, fechaDesde: '2027-04-02', fechaHasta: '2027-05-28', habitacionesDisponibles: 1 },
    ],
  },
  roma: {
    vuelos: [
      { id: 'v-rom-1', aerolinea: 'Andes Air', origen: 'Santiago', fechaSalida: '2027-04-09', fechaRegreso: '2027-04-23', precio: 934000, asientosDisponibles: 11 },
      { id: 'v-rom-2', aerolinea: 'Cóndor Líneas', origen: 'Santiago', fechaSalida: '2027-05-07', fechaRegreso: '2027-05-21', precio: 968000, asientosDisponibles: 3 },
    ],
    hoteles: [
      { id: 'h-rom-1', nombre: 'Hotel Colosseo', estrellas: 4, precioPorNoche: 119000, fechaDesde: '2027-04-09', fechaHasta: '2027-05-21', habitacionesDisponibles: 8 },
      { id: 'h-rom-2', nombre: 'Albergo Trastevere', estrellas: 3, precioPorNoche: 68000, fechaDesde: '2027-04-09', fechaHasta: '2027-05-21', habitacionesDisponibles: 5 },
    ],
  },
}
