export interface ProfesionalRequest {
  idUsuario: number;
  fechaDesde: string; // ISO date format - Inicio de experiencia en el oficio
  fechaHasta: string | null; // ISO date format - Fin de experiencia (null si aún ejerce)
  idOficio: number;
  precioMin: number;
  precioMax: number;
  especialidades: string[];
}
