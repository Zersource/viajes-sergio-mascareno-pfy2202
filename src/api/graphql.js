import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client'
import { BASE } from '../config.js'
import { TEXTO_OPCIONES_DE_VIAJE } from './consultas.js'

// Cliente Apollo apuntando a la API GraphQL simulada
export const clienteApollo = new ApolloClient({
  link: new HttpLink({ uri: `${BASE}graphql` }),
  cache: new InMemoryCache(),
})

export const OPCIONES_DE_VIAJE = gql(TEXTO_OPCIONES_DE_VIAJE)
