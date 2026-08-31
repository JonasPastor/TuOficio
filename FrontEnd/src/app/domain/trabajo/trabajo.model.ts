export interface Trabajo {
  id: number;
  idsolicitud: number;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'PAUSADO' | 'FINALIZADO' | 'CANCELADO';
  fechainicio?: string;
  fechafin?: string;
  tiempototaltrabajado?: number;
  ultimafechapausa?: string;
  tiempoantesdepausa?: number;
  descripcionfinalizacion?: string;
  costofinal?: number;
  motivocancelacion?: string;
  // Relaciones
  solicitud?: any;
  factura?: any;
}

export interface FinalizarTrabajoRequest {
  duracionReal?: number | null;
  montoFinal: number;
  montoAdicional?: number | null;
  descripcionAdicional?: string | null;
  fotoTrabajo?: string | null;
  observaciones: string;
}

export interface TrabajoResponse {
  idTrabajo: number;
  idSolicitud: number;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'PAUSADO' | 'FINALIZADO' | 'CANCELADO';
  nombreCliente: string;
  nombreProfesional: string;
  oficio: string;
  fechaInicio: string | null;
  fechaFinalizacion: string | null;
  duracionReal: number | null;
  montoFinal: number | null;
  montoAdicional: number | null;
  descripcionAdicional: string | null;
  fotoTrabajo: string | null;
  observacionesTrabajo: string | null;
  idFactura: number | null;
  estadoPago: string | null;
}

export interface TrabajoClienteResponse {
  idTrabajo: number;
  idSolicitud: number;
  profesional: string;
  descripcion: string;
  estado: string;
  fechaFinalizacion: string;
  montoFinal: string;
  idpago: string;
  estadoPago: string;
  nroFactura?: number; // Número de factura para descargar comprobante
  tieneResenia?: boolean; // Opcional
}
