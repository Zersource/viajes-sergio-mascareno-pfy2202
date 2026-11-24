// Etiqueta de disponibilidad: usa texto ademas del color
export default function Disponibilidad({ estado }) {
  return <span className={`etiqueta etiqueta-${estado.clase}`}>{estado.texto}</span>
}
