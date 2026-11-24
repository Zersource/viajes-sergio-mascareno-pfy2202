# Viajes Rumbo Sur - Agencia de viajes

Actividad sumativa S5 - "Integrando nuestro frontend con backend", Desarrollo Frontend II (PFY2202), Duoc UC.
Autor: Sergio Mascareno.

- Repositorio: https://github.com/Zersource/viajes-sergio-mascareno-pfy2202
- Sitio publicado (gh-pages): https://zersource.github.io/viajes-sergio-mascareno-pfy2202/

## Descripción

Aplicación de una agencia de viajes hecha con HTML, CSS, JavaScript y React 19 (con Vite y React Router 6).
La persona explora los destinos disponibles, selecciona uno y ve los vuelos y hoteles de ese destino con sus precios, fechas y disponibilidad.

No hay un servidor real: el backend es **simulado (mock) con MSW 2** y entrega los datos por dos vías:

| Dato | Vía | Cliente en el frontend |
|---|---|---|
| Destinos (país y actividades populares) | **API REST**: `GET api/destinos` | `fetch` (`src/api/destinosApi.js`) |
| Vuelos y hoteles de un destino (precios, fechas y disponibilidad) | **API GraphQL**: `POST graphql`, consulta `OpcionesDeViaje` | Apollo Client (`src/api/graphql.js`) |

Como GitHub Pages no tiene backend, el servidor simulado (un Service Worker de MSW) se activa tanto en desarrollo como en el sitio publicado.
La primera vez que se abre el sitio, el navegador lo registra y recién ahí se dibuja la aplicación.
Si el navegador carga la página sin el Service Worker (por ejemplo, con una recarga forzada `Ctrl+Shift+R`), la aplicación espera un instante a que el navegador le dé el control y, si no llega, se recarga una sola vez de forma normal para que el servidor simulado vuelva a responder (`src/main.jsx`).

## Cómo ejecutarlo

```bash
npm install
npm start
```

Se abre en `http://localhost:5173`. Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm test` | Pruebas unitarias del backend simulado y de los clientes REST y GraphQL |
| `npm run test:e2e` | Pruebas en navegador real con Playwright (necesita Playwright instalado en el equipo) |
| `npm run build` | Compila el sitio en `dist/` (ruta base de GitHub Pages) |
| `npm run preview` | Sirve la versión compilada, igual que en GitHub Pages |

## Páginas (React Router)

Se usa `HashRouter`, así las direcciones (`/#/destinos`) funcionan al recargar en GitHub Pages.

| Ruta | Página | Datos |
|---|---|---|
| `/` | Inicio | Ninguno |
| `/destinos` | Lista de destinos | REST: `GET api/destinos` |
| `/destinos/:destinoId` | Vuelos y hoteles del destino | REST (el destino) + GraphQL (vuelos y hoteles) |
| `*` | Página no encontrada | Ninguno |

Un `destinoId` que no existe (por ejemplo `/#/destinos/atlantida`) muestra "Destino no encontrado".

## API REST simulada

`GET api/destinos` responde `200` con una lista como esta:

```json
[
  {
    "id": "cusco",
    "nombre": "Cusco",
    "pais": "Perú",
    "descripcion": "Antigua capital del imperio inca, rodeada de montañas y ruinas.",
    "actividades": ["Visitar Machu Picchu", "Recorrer el Valle Sagrado", "Caminar por la Plaza de Armas"]
  }
]
```

Hay 6 destinos: Cusco, Río de Janeiro, Buenos Aires, Cartagena de Indias, Madrid y Roma.

## API GraphQL simulada

Una sola consulta trae los vuelos y los hoteles del destino elegido (en REST serían dos pedidos):

```graphql
query OpcionesDeViaje($destinoId: ID!) {
  vuelos(destinoId: $destinoId) {
    id aerolinea origen fechaSalida fechaRegreso precio asientosDisponibles
  }
  hoteles(destinoId: $destinoId) {
    id nombre estrellas precioPorNoche fechaDesde fechaHasta habitacionesDisponibles
  }
}
```

- `asientosDisponibles` y `habitacionesDisponibles` en `0` significan "Agotado"; de 1 a 5 se muestra "Quedan N"; con más, "Disponible".
- Todos los vuelos salen desde Santiago. Los precios están en pesos chilenos.
- Si el destino no existe, la API responde con el campo `errors` (como hace GraphQL) y la pantalla muestra el mensaje con un botón **Reintentar**.
- Apollo guarda las respuestas en su caché: volver a un destino ya visto no repite la consulta.

## Cómo se cubre cada criterio de la pauta

| Criterio | Qué se hizo | Dónde está |
|---|---|---|
| 1. Interfaz gráfica funcional y responsiva | Menú, tarjetas de destinos, listas de vuelos y hoteles, filtro de disponibilidad, mensajes de carga y de error. CSS propio con diseño que se adapta a 360, 390, 768 px y escritorio, sin desborde horizontal | `src/App.css`, `src/components/`, `src/pages/` |
| 2. API REST mock | `GET api/destinos` con MSW; el frontend la consume con `fetch` y muestra país y actividades de cada destino. Maneja error de red, tiempo agotado, 404/500 y respuesta ilegible | `src/mocks/handlers.js`, `src/api/destinosApi.js`, `src/pages/Destinos.jsx` |
| 3. API GraphQL mock | Consulta `OpcionesDeViaje` con MSW y Apollo Client (`useQuery`): precios, fechas y disponibilidad de vuelos y hoteles | `src/mocks/handlers.js`, `src/api/consultas.js`, `src/api/graphql.js`, `src/pages/DestinoDetalle.jsx` |
| 4. React Router | Rutas centralizadas con una página de plantilla (`Layout`), menú con `NavLink`, ruta con parámetro y ruta para páginas inexistentes | `src/routes/AppRoutes.jsx`, `src/components/Layout.jsx` |
| 5. Código modular y reutilizable | Componentes pequeños que se reutilizan (`Cargando`, `MensajeError`, `Disponibilidad`, `SeccionOpciones`, `Estrellas`, `TarjetaVuelo`, `TarjetaHotel`), hooks, contexto y utilidades separados por carpeta | `src/` |
| 6. Manejo de estado con useState y useEffect | `DestinosProvider` pide los destinos con `useEffect` y guarda estado, lista y error con `useState`; el filtro de disponibilidad y el título de la pestaña también | `src/context/DestinosContext.jsx`, `src/pages/DestinoDetalle.jsx`, `src/hooks/useTitulo.js` |
| 7. Publicación en GitHub con documentación | Repositorio público `viajes-sergio-mascareno-pfy2202`, este README y el sitio en la rama `gh-pages` | Este repositorio |
| 8. Pruebas en distintos navegadores | Pruebas unitarias y de navegador (ver más abajo), con un script que acepta Chromium, Firefox y WebKit | `pruebas/` |

## Estructura del proyecto

```
public/mockServiceWorker.js   Service Worker de MSW (generado con npx msw init public)
src/
  api/                        destinosApi.js (cliente REST), consultas.js y graphql.js (Apollo)
  mocks/                      datos.js, handlers.js (REST y GraphQL) y browser.js
  context/DestinosContext.jsx Estado de los destinos compartido por las páginas
  hooks/useTitulo.js
  components/                 Layout, Cargando, MensajeError, Disponibilidad, Estrellas,
                              SeccionOpciones, TarjetaDestino, TarjetaVuelo, TarjetaHotel
  pages/                      Inicio, Destinos, DestinoDetalle, NoEncontrada
  routes/AppRoutes.jsx        Rutas con React Router
  utils/formato.js            Precio en pesos chilenos, fechas y estados de disponibilidad
  App.jsx, App.css, config.js, main.jsx
pruebas/
  api.test.mjs                Pruebas unitarias (12)
  e2e.mjs                     Pruebas en navegador
```

## Pruebas

- **Unitarias (`npm test`)**: 12 pruebas con MSW en modo Node. Revisan los 6 destinos, los vuelos y hoteles de cada destino (precios, fechas y disponibilidad), el error GraphQL de un destino inexistente, la caché de Apollo y cada tipo de falla del cliente REST (500, 404, respuesta que no es JSON, falla de red y pedido cancelado).
- **Navegador (`npm run test:e2e`)**: recorren el sitio en desarrollo (`npm start`) y en la versión compilada servida bajo `/viajes-sergio-mascareno-pfy2202/`, que es la ruta de GitHub Pages. Se repite en 4 anchos (360, 390, 768 y 1366 px): carga de destinos por REST, selección de destino, vuelos y hoteles por GraphQL, filtro, botón atrás, recarga en una ruta interna, rutas inexistentes, ausencia de desborde horizontal y de errores en consola. Aparte se simulan fallas del backend (REST con 500 y con respuesta que no es JSON, GraphQL con `errors` y sin conexión) y se comprueba el mensaje y el botón **Reintentar**. También se prueba que la primera visita no se recarga sola y que una página que queda sin control del Service Worker se recarga una sola vez.
- **Navegadores**: por defecto se prueba Chromium. Para probar también Firefox y WebKit:

```bash
npm install --no-save playwright
npx playwright install chromium firefox webkit
NAVEGADORES=chromium,firefox,webkit npm run test:e2e
```
- **HTML**: el HTML renderizado de cada página de la versión compilada se validó con el validador W3C (`vnu.jar`) sin errores ni advertencias.
- **Resultado en navegadores**: las pruebas de navegador se ejecutaron con Playwright 1.57.0 en macOS sobre Chromium 143 y WebKit 26.0: 576 verificaciones (288 por navegador), 0 fallas. Ademas se reviso a mano el sitio publicado en Chrome y en Brave: destinos, vuelos y hoteles de Cusco, filtro de disponibilidad, recarga en `#/destinos/madrid` y vista angosta, sin errores de la aplicacion en la consola.
