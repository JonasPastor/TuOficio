export interface MetricasUsuarios {
  cantProfesionales: number;
  cantClientes: number;
}

export interface UsuarioMetrica {
  nombre: string;
  email: string;
  strikes: number;
  estado: boolean;
}

export interface ProfesionalMetrica {
  nombre: string;
  oficio: string;
  calificacion: string;
  serviciosCompletados: number;
}

export interface UsuarioRequest {
  password: string;
  name: string;
  lastName: string;
  email: string;
  documento: string;
  telefono: string;
  nacimiento: string; // ISO date string format (YYYY-MM-DD)
  idCiudad: number;
  idBarrio: number;
  idTipoDoc: number;
  calle: string;
  numero: string;
  depto?: string; // Optional field
  piso?: string; // Optional field
  observaciones?: string; // Optional field
}

export interface UsuarioRegistro extends UsuarioRequest {
  confirmPassword?: string; // Additional field for password confirmation in forms
}

// Interfaces for location data
export interface Ciudad {
  id: number;
  nombre: string;
  codigoPostal?: string;
}

export interface Barrio {
  id: number;
  nombre: string;
  idCiudad: number;
}

export interface TipoDocumento {
  id: number;
  nombre: string;
  codigo: string; // e.g., "DNI", "CUIL", "CUIT", "LE", "LC"
}

// Optional: If you need validation rules or form structure
export interface UsuarioRequestValidation {
  password: {
    required: true;
    minLength: 8;
  };
  name: {
    required: true;
    maxLength: 50;
  };
  lastName: {
    required: true;
    maxLength: 50;
  };
  email: {
    required: true;
    pattern: string; // email pattern
  };
  documento: {
    required: true;
  };
  telefono: {
    required: true;
  };
  nacimiento: {
    required: true;
  };
  idCiudad: {
    required: true;
  };
  idBarrio: {
    required: true;
  };
  idTipoDoc: {
    required: true;
  };
  calle: {
    required: true;
    maxLength: 100;
  };
  numero: {
    required: true;
    maxLength: 10;
  };
  depto: {
    required: false;
    maxLength: 10;
  };
  piso: {
    required: false;
    maxLength: 10;
  };
  observaciones: {
    required: false;
    maxLength: 255;
  };
}

// Type for form data (before conversion to request)
export interface UsuarioFormData {
  password: string;
  confirmPassword: string;
  name: string;
  lastName: string;
  email: string;
  documento: string;
  telefono: string;
  nacimiento: Date | string; // Can handle both Date object and string
  idCiudad: number;
  idBarrio: number;
  idTipoDoc: number;
  calle: string;
  numero: string;
  depto?: string;
  piso?: string;
  observaciones?: string;
}
