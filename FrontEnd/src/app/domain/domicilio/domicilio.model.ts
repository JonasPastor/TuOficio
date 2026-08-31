export interface Departamento {
  id: number;
  departamento: string;
}

export interface Ciudad {
  id: number;
  ciudad: string;
  iddepartamento: {
    id: number;
  };
}

export interface Barrio {
  id: number;
  barrio: string;
  idciudad: {
    id: number;
  };
}

export interface TipoDocumento {
  id: number;
  tipo: string;
  descripcion?: string;
}
