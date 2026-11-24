const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

export function formatearPrecio(valor) {
  return pesos.format(valor)
}

// Las fechas llegan como 'AAAA-MM-DD'; se interpretan en hora local para que no se corran un dia.
export function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Estado de disponibilidad a partir de la cantidad de asientos o habitaciones.
export function estadoDisponibilidad(cantidad, unidad) {
  if (cantidad <= 0) return { clase: 'agotado', texto: 'Agotado' }
  if (cantidad <= 5) return { clase: 'pocos', texto: `Quedan ${cantidad} ${cantidad === 1 ? unidad.singular : unidad.plural}` }
  return { clase: 'disponible', texto: `Disponible (${cantidad} ${unidad.plural})` }
}

export const UNIDAD_ASIENTOS = { singular: 'asiento', plural: 'asientos' }
export const UNIDAD_HABITACIONES = { singular: 'habitación', plural: 'habitaciones' }
