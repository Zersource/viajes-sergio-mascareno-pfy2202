import { HashRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { clienteApollo } from './api/graphql'
import { DestinosProvider } from './context/DestinosContext'
import AppRoutes from './routes/AppRoutes'

// HashRouter: las direcciones quedan como /#/destinos, asi funcionan al recargar en GitHub Pages
export default function App() {
  return (
    <ApolloProvider client={clienteApollo}>
      <DestinosProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </DestinosProvider>
    </ApolloProvider>
  )
}
