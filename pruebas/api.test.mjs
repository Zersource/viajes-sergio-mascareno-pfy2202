// Pruebas unitarias del backend simulado y de los clientes REST y GraphQL (sin navegador).
// MSW en modo Node intercepta los pedidos de fetch, igual que el Service Worker lo hace en el navegador.
import test, { before, after, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import apollo from '@apollo/client' // paquete CommonJS: se importa completo
import { crearHandlers } from '../src/mocks/handlers.js'
import { destinos, opcionesPorDestino } from '../src/mocks/datos.js'
import { listarDestinos, ErrorApi } from '../src/api/destinosApi.js'
import { TEXTO_OPCIONES_DE_VIAJE } from '../src/api/consultas.js'
import { estadoDisponibilidad, formatearFecha, formatearPrecio, UNIDAD_ASIENTOS } from '../src/utils/formato.js'

const { ApolloClient, InMemoryCache, HttpLink, gql } = apollo
const OPCIONES_DE_VIAJE = gql(TEXTO_OPCIONES_DE_VIAJE)
const BASE = 'http://localhost:4000/'
const servidor = setupServer(...crearHandlers(BASE))
before(() => servidor.listen({ onUnhandledRequest: 'error' }))
afterEach(() => servidor.resetHandlers(...crearHandlers(BASE)))
after(() => servidor.close())

const nuevoCliente = () =>
  new ApolloClient({ link: new HttpLink({ uri: `${BASE}graphql`, fetch }), cache: new InMemoryCache(), defaultOptions: { query: { errorPolicy: 'none' } } })

test('REST: lista los 6 destinos con pais y actividades populares', async () => {
  const lista = await listarDestinos({ base: BASE })
  assert.equal(lista.length, 6)
  for (const d of lista) {
    assert.ok(d.id && d.nombre && d.pais && d.descripcion, `destino ${d.id} con datos basicos`)
    assert.ok(Array.isArray(d.actividades) && d.actividades.length >= 3, `destino ${d.id} con actividades`)
  }
  assert.deepEqual(lista.map((d) => d.id), destinos.map((d) => d.id))
})

test('REST: un 500 se traduce a un ErrorApi legible', async () => {
  servidor.use(http.get(`${BASE}api/destinos`, () => HttpResponse.json({ message: 'x' }, { status: 500 })))
  await assert.rejects(listarDestinos({ base: BASE }), (e) => e instanceof ErrorApi && e.tipo === 'http' && e.estado === 500 && /servidor/.test(e.message))
})

test('REST: un 404 se traduce a un ErrorApi legible', async () => {
  servidor.use(http.get(`${BASE}api/destinos`, () => new HttpResponse(null, { status: 404 })))
  await assert.rejects(listarDestinos({ base: BASE }), (e) => e.tipo === 'http' && e.estado === 404)
})

test('REST: una respuesta que no es JSON se informa como ilegible', async () => {
  servidor.use(http.get(`${BASE}api/destinos`, () => new HttpResponse('<html>hola</html>', { headers: { 'Content-Type': 'text/html' } })))
  await assert.rejects(listarDestinos({ base: BASE }), (e) => e.tipo === 'formato')
})

test('REST: una falla de red se informa como falla de conexion', async () => {
  servidor.use(http.get(`${BASE}api/destinos`, () => HttpResponse.error()))
  await assert.rejects(listarDestinos({ base: BASE }), (e) => e.tipo === 'red')
})

test('REST: si la pantalla cancela el pedido, no se convierte en ErrorApi', async () => {
  const control = new AbortController()
  const pedido = listarDestinos({ base: BASE, signal: control.signal })
  control.abort()
  await assert.rejects(pedido, (e) => !(e instanceof ErrorApi))
})

test('GraphQL: cada destino devuelve vuelos y hoteles con precios, fechas y disponibilidad', async () => {
  const cliente = nuevoCliente()
  for (const d of destinos) {
    const { data } = await cliente.query({ query: OPCIONES_DE_VIAJE, variables: { destinoId: d.id } })
    assert.equal(data.vuelos.length, opcionesPorDestino[d.id].vuelos.length)
    assert.equal(data.hoteles.length, opcionesPorDestino[d.id].hoteles.length)
    assert.ok(data.vuelos.length >= 2 && data.hoteles.length >= 2, `${d.id} tiene opciones`)
    for (const v of data.vuelos) {
      assert.ok(v.aerolinea && v.origen && /^\d{4}-\d{2}-\d{2}$/.test(v.fechaSalida) && /^\d{4}-\d{2}-\d{2}$/.test(v.fechaRegreso))
      assert.ok(v.precio > 0 && Number.isInteger(v.asientosDisponibles) && v.asientosDisponibles >= 0)
      assert.ok(v.fechaRegreso > v.fechaSalida, 'el regreso es posterior a la salida')
    }
    for (const h of data.hoteles) {
      assert.ok(h.nombre && h.estrellas >= 1 && h.estrellas <= 5 && h.precioPorNoche > 0)
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(h.fechaDesde) && h.fechaHasta > h.fechaDesde)
      assert.ok(Number.isInteger(h.habitacionesDisponibles) && h.habitacionesDisponibles >= 0)
    }
  }
})

test('GraphQL: una consulta enviada por POST /graphql responde con data.vuelos', async () => {
  const respuesta = await fetch(`${BASE}graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName: 'OpcionesDeViaje', query: 'query OpcionesDeViaje($destinoId: ID!) { vuelos(destinoId: $destinoId) { id precio } hoteles(destinoId: $destinoId) { id } }', variables: { destinoId: 'cusco' } }),
  })
  const { data } = await respuesta.json()
  assert.ok(data.vuelos.length > 0)
  assert.ok(data.vuelos.every((v) => 'precio' in v))
})

test('GraphQL: un destino inexistente devuelve un error GraphQL', async () => {
  const cliente = nuevoCliente()
  await assert.rejects(cliente.query({ query: OPCIONES_DE_VIAJE, variables: { destinoId: 'atlantida' } }), (e) => e.graphQLErrors?.[0]?.message.includes('atlantida'))
})

test('GraphQL: la segunda consulta al mismo destino sale de la cache de Apollo', async () => {
  const cliente = nuevoCliente()
  let pedidos = 0
  servidor.events.on('request:start', ({ request }) => request.url.endsWith('/graphql') && pedidos++)
  await cliente.query({ query: OPCIONES_DE_VIAJE, variables: { destinoId: 'roma' } })
  await cliente.query({ query: OPCIONES_DE_VIAJE, variables: { destinoId: 'roma' } })
  servidor.events.removeAllListeners()
  assert.equal(pedidos, 1)
})

test('Formato: precio en pesos chilenos y fecha sin correrse de dia', () => {
  assert.match(formatearPrecio(289000), /289\.000/)
  assert.match(formatearFecha('2027-02-10'), /10/)
  assert.match(formatearFecha('2027-02-10'), /2027/)
  assert.match(formatearFecha('2027-03-01'), /^1 /)
})

test('Formato: estados de disponibilidad', () => {
  assert.equal(estadoDisponibilidad(0, UNIDAD_ASIENTOS).clase, 'agotado')
  assert.equal(estadoDisponibilidad(1, UNIDAD_ASIENTOS).texto, 'Quedan 1 asiento')
  assert.equal(estadoDisponibilidad(3, UNIDAD_ASIENTOS).clase, 'pocos')
  assert.equal(estadoDisponibilidad(5, UNIDAD_ASIENTOS).clase, 'pocos')
  assert.equal(estadoDisponibilidad(6, UNIDAD_ASIENTOS).clase, 'disponible')
})
