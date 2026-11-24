// Pruebas de extremo a extremo en navegador real con Playwright.
// Prueban el sitio en desarrollo (npm start) y la version compilada servida bajo /viajes-sergio-mascareno-pfy2202/,
// que es la ruta de GitHub Pages.
//
// Uso:  npm run test:e2e
//   NAVEGADORES=chromium,firefox,webkit  navegadores a probar (por defecto: chromium)
//   VOLCAR_HTML=carpeta   guarda el HTML renderizado de cada pagina (para validarlo con vnu)
//   CAPTURAS=carpeta      guarda capturas de pantalla
import { createRequire } from 'node:module'
import { execFileSync, execSync, spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

let playwright
try {
  playwright = await import('playwright')
} catch {
  playwright = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright')
}

const REPO = 'viajes-sergio-mascareno-pfy2202'
const navegadores = (process.env.NAVEGADORES || 'chromium').split(',').map((n) => n.trim())
const volcarHtml = process.env.VOLCAR_HTML
const capturas = process.env.CAPTURAS
if (volcarHtml) mkdirSync(volcarHtml, { recursive: true })
if (capturas) mkdirSync(capturas, { recursive: true })

// Se lanza Vite directamente con Node (sin npx), asi el proceso se puede cerrar de verdad al terminar
// y funciona igual en Windows, Mac y Linux.
const vite = join(dirname(createRequire(import.meta.url).resolve('vite/package.json')), 'bin', 'vite.js')
const hijos = []
function levantar(args, puerto, ruta) {
  hijos.push(spawn(process.execPath, [vite, ...args, '--port', String(puerto), '--strictPort'], { stdio: 'ignore' }))
  return `http://localhost:${puerto}${ruta}`
}
async function esperar(url) {
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(url)).ok) return } catch { /* aun no levanta */ }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('No levanto el servidor: ' + url)
}

execFileSync(process.execPath, [vite, 'build'], { stdio: 'ignore' })
const objetivos = [
  { nombre: 'desarrollo', url: levantar([], 5301, '/') },
  { nombre: 'publicado', url: levantar(['preview'], 5302, `/${REPO}/`) },
]
for (const o of objetivos) await esperar(o.url)

let ok = 0
let fail = 0
const check = (cond, msg) => { cond ? ok++ : fail++; console.log((cond ? 'OK   ' : 'FALLA') + ' ' + msg) }

const anchos = [['360', 360, 780], ['390', 390, 844], ['768', 768, 1024], ['desktop', 1366, 800]]
const tarjetas = 'main ul.grilla > li'
const estado = '[role="status"]'
const alerta = '[role="alert"]'

async function volcar(page, nombre) {
  if (volcarHtml) writeFileSync(`${volcarHtml}/${nombre}.html`, '<!DOCTYPE html>\n' + (await page.evaluate(() => document.documentElement.outerHTML)))
}
async function foto(page, nombre) {
  if (capturas) await page.screenshot({ path: `${capturas}/${nombre}.png`, fullPage: true })
}
const sinDesborde = (page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

for (const nombreNav of navegadores) {
  const tipo = playwright[nombreNav]
  let browser
  try {
    browser = await tipo.launch()
  } catch (e) {
    check(false, `[${nombreNav}] no se pudo abrir el navegador: ${String(e.message).split('\n')[0]}`)
    continue
  }

  for (const objetivo of objetivos) {
    for (const [ancho, w, h] of anchos) {
      const etiqueta = `${nombreNav}/${objetivo.nombre}/${ancho}`
      console.log(`\n=== ${etiqueta} ===`)
      const context = await browser.newContext({ viewport: { width: w, height: h } })
      const page = await context.newPage()
      const errores = []
      const graphql = []
      page.on('pageerror', (e) => errores.push(e.message))
      page.on('console', (m) => m.type() === 'error' && errores.push(m.text()))
      page.on('request', (r) => r.url().endsWith('/graphql') && graphql.push(r.postData() || ''))
      const base = objetivo.url
      const cuentaGraphql = (id) => graphql.filter((p) => p.includes(`"destinoId":"${id}"`)).length

      // ---- Inicio
      await page.goto(base)
      await page.waitForSelector('h1')
      check((await page.locator('h1').innerText()) === 'Planifica tu próximo viaje', `[${etiqueta}] Inicio muestra el titulo`)
      check((await page.locator('nav[aria-label="Menú principal"] a').count()) === 2, `[${etiqueta}] Menu principal con 2 enlaces`)
      check(await sinDesborde(page), `[${etiqueta}] Inicio sin desborde horizontal`)
      await volcar(page, `inicio-${objetivo.nombre}-${ancho}`)
      await foto(page, `inicio-${objetivo.nombre}-${ancho}`)

      // ---- Destinos (API REST)
      await page.getByRole('link', { name: 'Destinos', exact: true }).click()
      await page.getByRole('status').filter({ hasText: 'Cargando destinos...' }).waitFor()
      check(true, `[${etiqueta}] Muestra "Cargando destinos..." mientras responde la API REST`)
      await page.locator(tarjetas).first().waitFor()
      check((await page.locator(tarjetas).count()) === 6, `[${etiqueta}] Lista 6 destinos desde la API REST`)
      check((await page.locator(estado).count()) === 0, `[${etiqueta}] El indicador de carga se retira al llegar los datos`)
      const textoCusco = await page.locator(tarjetas).first().innerText()
      check(/Perú/i.test(textoCusco) && /Machu Picchu/.test(textoCusco), `[${etiqueta}] Cada destino muestra pais y actividades populares`)
      const acts = await page.locator(`${tarjetas} .lista-simple`).evaluateAll((uls) => uls.map((u) => u.children.length))
      check(acts.every((n) => n >= 3), `[${etiqueta}] Todos los destinos tienen 3 actividades`)
      check(await sinDesborde(page), `[${etiqueta}] Destinos sin desborde horizontal`)
      check(page.url().endsWith('#/destinos'), `[${etiqueta}] La URL del router es #/destinos`)
      await volcar(page, `destinos-${objetivo.nombre}-${ancho}`)
      await foto(page, `destinos-${objetivo.nombre}-${ancho}`)

      // ---- Seleccionar un destino -> vuelos y hoteles (API GraphQL)
      await page.getByRole('link', { name: 'Ver vuelos y hoteles de Cusco' }).click()
      await page.getByRole('status').filter({ hasText: 'Buscando vuelos y hoteles en Cusco...' }).waitFor()
      check(true, `[${etiqueta}] Muestra "Buscando vuelos y hoteles..." mientras responde GraphQL`)
      await page.getByRole('heading', { name: /^Vuelos/ }).waitFor()
      check(page.url().endsWith('#/destinos/cusco'), `[${etiqueta}] La URL del router es #/destinos/cusco`)
      check((await page.locator('h1').innerText()) === 'Cusco', `[${etiqueta}] El detalle muestra el nombre del destino`)
      check((await page.locator('#vuelos ~ ul > li').count()) === 3, `[${etiqueta}] Cusco: 3 vuelos`)
      check((await page.locator('#hoteles ~ ul > li').count()) === 3, `[${etiqueta}] Cusco: 3 hoteles`)
      const detalle = await page.locator('main').innerText()
      check(/289\.000/.test(detalle) && /78\.000/.test(detalle), `[${etiqueta}] Muestra precios en pesos`)
      check(/2027/.test(detalle) && /Salida/.test(detalle) && /Regreso/.test(detalle), `[${etiqueta}] Muestra fechas de vuelos y hoteles`)
      check(/Agotado/.test(detalle) && /Quedan 3 asientos/.test(detalle) && /Disponible \(14 asientos\)/.test(detalle), `[${etiqueta}] Muestra la disponibilidad (disponible, pocos y agotado)`)
      check(/Machu Picchu/.test(detalle), `[${etiqueta}] El detalle conserva las actividades del destino (REST)`)
      check(await sinDesborde(page), `[${etiqueta}] Detalle sin desborde horizontal`)
      await volcar(page, `detalle-${objetivo.nombre}-${ancho}`)
      await foto(page, `detalle-${objetivo.nombre}-${ancho}`)

      // ---- Filtro con estado (useState)
      await page.getByLabel('Mostrar solo opciones con disponibilidad').check()
      check((await page.locator('#vuelos ~ ul > li').count()) === 2 && (await page.locator('#hoteles ~ ul > li').count()) === 2, `[${etiqueta}] El filtro deja solo las opciones con disponibilidad (2 y 2)`)
      check(!/Agotado/.test(await page.locator('main').innerText()), `[${etiqueta}] Con el filtro no queda nada agotado`)
      await page.getByLabel('Mostrar solo opciones con disponibilidad').uncheck()
      check((await page.locator('#vuelos ~ ul > li').count()) === 3, `[${etiqueta}] Al desmarcar el filtro vuelven todas`)

      // ---- Volver, elegir otro destino, y volver al primero (cache de Apollo)
      await page.getByRole('link', { name: '← Todos los destinos' }).click()
      await page.locator(tarjetas).first().waitFor()
      check((await page.locator(estado).count()) === 0, `[${etiqueta}] Volver a Destinos no vuelve a pedirlos (sin indicador de carga)`)
      await page.getByRole('link', { name: 'Ver vuelos y hoteles de Roma' }).click()
      await page.getByRole('heading', { name: /^Vuelos/ }).waitFor()
      check((await page.locator('h1').innerText()) === 'Roma', `[${etiqueta}] Selecciona otro destino (Roma)`)
      check((await page.locator('#vuelos ~ ul > li').count()) === 2 && (await page.locator('#hoteles ~ ul > li').count()) === 2, `[${etiqueta}] Roma: 2 vuelos y 2 hoteles`)
      await page.goBack()
      await page.locator(tarjetas).first().waitFor()
      await page.getByRole('link', { name: 'Ver vuelos y hoteles de Cusco' }).click()
      await page.getByRole('heading', { name: /^Vuelos/ }).waitFor()
      check(cuentaGraphql('cusco') === 1, `[${etiqueta}] Volver a un destino ya visto no repite la consulta GraphQL (cache)`)

      // ---- Boton atras del navegador y recarga en una ruta interna
      await page.goBack()
      check(page.url().endsWith('#/destinos'), `[${etiqueta}] El boton atras vuelve a Destinos`)
      await page.goto(base + '#/destinos/madrid')
      await page.reload()
      await page.getByRole('heading', { name: /^Vuelos/ }).waitFor()
      check((await page.locator('h1').innerText()) === 'Madrid', `[${etiqueta}] Recargar en #/destinos/madrid abre Madrid`)

      // ---- Rutas que no existen
      await page.goto(base + '#/destinos/atlantida')
      await page.getByRole('alert').waitFor()
      check(/Destino no encontrado/.test(await page.locator(alerta).innerText()), `[${etiqueta}] Un destino inexistente muestra "Destino no encontrado"`)
      await page.goto(base + '#/ruta-que-no-existe')
      await page.getByRole('heading', { name: 'Página no encontrada' }).waitFor()
      check(true, `[${etiqueta}] Una ruta inexistente muestra "Página no encontrada"`)
      check((await page.title()).startsWith('Página no encontrada'), `[${etiqueta}] El titulo de la pestana cambia segun la pagina`)

      check(errores.length === 0, `[${etiqueta}] Sin errores en consola${errores.length ? ': ' + errores.join(' | ') : ''}`)
      await context.close()
    }

    // ---- Fallas del backend (sin Service Worker, con respuestas controladas por la prueba)
    const etiqueta = `${nombreNav}/${objetivo.nombre}/fallas`
    console.log(`\n=== ${etiqueta} ===`)
    const base = objetivo.url
    const apiDestinos = '**/api/destinos'
    const apiGraphql = '**/graphql'
    const destinosBuenos = JSON.stringify([{ id: 'prueba', nombre: 'Lugar de prueba', pais: 'Chile', descripcion: 'Descripcion', actividades: ['A', 'B', 'C'] }])
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })
    const page = await ctx.newPage()
    const errores = []
    page.on('pageerror', (e) => errores.push(e.message))
    page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errores.push(m.text()))

    let respuestaRest = { status: 500, body: '{"message":"x"}' }
    await page.route(apiDestinos, (ruta) => ruta.fulfill({ contentType: 'application/json', ...respuestaRest }))
    await page.goto(base + '#/destinos')
    await page.getByRole('alert').waitFor()
    check(/No pudimos cargar los destinos/.test(await page.locator(alerta).innerText()) && /servidor tuvo un problema/.test(await page.locator(alerta).innerText()), `[${etiqueta}] REST 500: mensaje de error claro`)
    respuestaRest = { status: 200, body: destinosBuenos }
    await page.getByRole('button', { name: 'Reintentar' }).click()
    await page.locator(tarjetas).first().waitFor()
    check((await page.locator(tarjetas).count()) === 1 && (await page.locator(alerta).count()) === 0, `[${etiqueta}] REST: Reintentar recupera la lista`)

    let respuestaGql = { status: 200, body: JSON.stringify({ errors: [{ message: 'Servicio de vuelos no disponible.' }] }) }
    await page.route(apiGraphql, (ruta) => ruta.fulfill({ contentType: 'application/json', ...respuestaGql }))
    await page.getByRole('link', { name: 'Ver vuelos y hoteles de Lugar de prueba' }).click()
    await page.getByRole('alert').waitFor()
    check(/No pudimos cargar las opciones/.test(await page.locator(alerta).innerText()) && /Servicio de vuelos no disponible/.test(await page.locator(alerta).innerText()), `[${etiqueta}] GraphQL con errors: muestra el mensaje de la API`)
    respuestaGql = { status: 200, body: JSON.stringify({ data: { vuelos: [], hoteles: [] } }) }
    await page.getByRole('button', { name: 'Reintentar' }).click()
    await page.getByRole('heading', { name: /^Vuelos/ }).waitFor()
    check(/No hay vuelos/.test(await page.locator('#vuelos ~ .vacio').innerText()) && /No hay hoteles/.test(await page.locator('#hoteles ~ .vacio').innerText()), `[${etiqueta}] GraphQL: Reintentar funciona y una lista vacia muestra un mensaje`)

    await page.unroute(apiGraphql)
    await page.route(apiGraphql, (ruta) => ruta.abort('failed'))
    await page.goto(base + '#/destinos')
    await page.reload() // recarga completa: se vacia la cache de Apollo
    await page.getByRole('link', { name: 'Ver vuelos y hoteles de Lugar de prueba' }).click()
    await page.getByRole('alert').waitFor()
    check(/No se pudo conectar/.test(await page.locator(alerta).innerText()), `[${etiqueta}] GraphQL sin conexion: mensaje de falla de conexion`)

    await page.unroute(apiDestinos)
    await page.route(apiDestinos, (ruta) => ruta.fulfill({ status: 200, contentType: 'text/html', body: '<html>no es json</html>' }))
    await page.goto(base + '#/destinos')
    await page.reload()
    await page.getByRole('alert').waitFor()
    check(/no se pudo leer/.test(await page.locator(alerta).innerText()), `[${etiqueta}] REST con respuesta que no es JSON: mensaje claro`)
    check(errores.length === 0, `[${etiqueta}] La app no lanza errores no controlados${errores.length ? ': ' + errores.join(' | ') : ''}`)
    await ctx.close()
  }
  await browser.close()
}

hijos.forEach((h) => h.kill())
console.log(`\n${ok} OK, ${fail} FALLAS`)
process.exit(fail ? 1 : 0)
