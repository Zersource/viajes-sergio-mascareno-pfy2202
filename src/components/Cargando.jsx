export default function Cargando({ mensaje }) {
  return (
    <div className="cargando" role="status" aria-live="polite">
      <span className="giro" aria-hidden="true" />
      <p>{mensaje}</p>
    </div>
  )
}
