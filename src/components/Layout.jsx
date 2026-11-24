import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="sitio">
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <header className="encabezado">
        <div className="contenedor encabezado-interior">
          <NavLink to="/" className="marca">
            <span aria-hidden="true">✈</span> Viajes Rumbo Sur
          </NavLink>
          <nav aria-label="Menú principal">
            <ul className="menu">
              <li>
                <NavLink to="/" end>
                  Inicio
                </NavLink>
              </li>
              <li>
                <NavLink to="/destinos">Destinos</NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="contenido" className="contenedor principal" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="pie">
        <div className="contenedor">
          <p>Viajes Rumbo Sur · Proyecto de Desarrollo Frontend II (PFY2202) · Los datos son simulados.</p>
        </div>
      </footer>
    </div>
  )
}
