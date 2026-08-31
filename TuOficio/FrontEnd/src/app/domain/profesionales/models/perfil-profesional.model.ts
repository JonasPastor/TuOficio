export interface DisponibilidadHorario {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface FotoGaleria {
  id?: number;
  urlFoto: string;
  descripcion?: string;
  fechaSubida?: string;
  orden?: number;
}

export interface PerfilProfesional {
  idProfesional: number;
  nombre: string;
  apellido: string;
  email?: string;
  avatar?: string;
  oficio: string;
  telefono: string;
  rangoPrecio: string;
  disponibilidad?: DisponibilidadHorario[]; // Opcional
  especialidades: string[];
  puntuacionPromedio?: number;
  cantidadResenias?: number;
  serviciosCompletados?: number;
  fotosGaleria?: FotoGaleria[];
}
