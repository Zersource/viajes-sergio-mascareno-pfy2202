import { http, graphql, HttpResponse, delay } from 'msw'
import { destinos, opcionesPorDestino } from './datos.js'

// Fabrica de handlers: recibe la ruta base ('/' en desarrollo, '/viajes-.../' en GitHub Pages;
// en las pruebas de Node, una URL completa). Asi el mismo backend simulado funciona en todos lados.
export function crearHandlers(base) {
  // GraphQL solo en <base>graphql, para no interceptar ninguna otra cosa
  const api = graphql.link(`${base}graphql`)

  return [
    // REST: GET <base>api/destinos -> destinos disponibles (con pais y actividades populares)
    http.get(`${base}api/destinos`, async () => {
      await delay(700)
      return HttpResponse.json(destinos)
    }),

    // GraphQL: query OpcionesDeViaje($destinoId) -> vuelos y hoteles de un destino, en una sola consulta
    api.query('OpcionesDeViaje', async ({ variables }) => {
      await delay(900)
      const opciones = opcionesPorDestino[variables.destinoId]
      if (!opciones) {
        return HttpResponse.json({
          errors: [{ message: `El destino "${variables.destinoId}" no existe.`, extensions: { code: 'NOT_FOUND' } }],
        })
      }
      // __typename lo agrega cualquier servidor GraphQL real y Apollo lo usa para su cache
      return HttpResponse.json({
        data: {
          vuelos: opciones.vuelos.map((v) => ({ __typename: 'Vuelo', ...v })),
          hoteles: opciones.hoteles.map((h) => ({ __typename: 'Hotel', ...h })),
        },
      })
    }),
  ]
}
