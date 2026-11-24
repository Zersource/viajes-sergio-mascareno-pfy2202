// Bloque con titulo y lista de opciones (se usa para vuelos y para hoteles)
export default function SeccionOpciones({ id, titulo, cantidad, vacio, children }) {
  return (
    <section aria-labelledby={id} className="seccion-opciones">
      <h2 id={id}>
        {titulo} <span className="contador">({cantidad})</span>
      </h2>
      {cantidad === 0 ? <p className="vacio">{vacio}</p> : <ul className="lista-opciones">{children}</ul>}
    </section>
  )
}
