import { Route, Routes } from 'react-router-dom'
import Layout from '../components/Layout'
import Inicio from '../pages/Inicio'
import Destinos from '../pages/Destinos'
import DestinoDetalle from '../pages/DestinoDetalle'
import NoEncontrada from '../pages/NoEncontrada'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="destinos" element={<Destinos />} />
        <Route path="destinos/:destinoId" element={<DestinoDetalle />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
