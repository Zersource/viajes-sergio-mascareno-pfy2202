// Ruta base del sitio ('/' en desarrollo y '/viajes-sergio-mascareno-pfy2202/' en GitHub Pages).
// Las dos APIs simuladas viven bajo esa ruta: REST en <base>api/destinos y GraphQL en <base>graphql.
export const BASE = import.meta.env?.BASE_URL ?? '/'
