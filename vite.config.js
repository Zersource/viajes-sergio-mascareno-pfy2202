import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En GitHub Pages el sitio vive en /viajes-sergio-mascareno-pfy2202/, por eso esa ruta base al compilar
// y tambien en "npm run preview" (que sirve la version compilada). En desarrollo (npm start) se sirve desde la raiz.
const BASE_PUBLICADO = '/viajes-sergio-mascareno-pfy2202/'
const esPreview = process.argv.includes('preview')

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' || esPreview ? BASE_PUBLICADO : '/',
}))
