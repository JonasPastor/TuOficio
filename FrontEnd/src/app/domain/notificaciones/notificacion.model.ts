export type TipoNotificacion = 'NUEVA_SOLICITUD' | 'TRABAJO_FINALIZADO' | 'MENSAJE_NUEVO' | 'TRABAJO_CANCELADO' | 'SOLICITUD_RECHAZADA' | 'REPORTE_PROFESIONAL';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  idRelacionado?: number; // ID de la solicitud, trabajo o mensaje relacionado
  urlAccion?: string; // URL para navegar al hacer clic
  motivoCancelacion?: string; // Razón de cancelación si aplica
  montoFinal?: number; // Monto del trabajo si aplica
}

export interface NotificacionResponse {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  idRelacionado?: number;
  urlAccion?: string;
}

export interface ReporteProfesional {
  idProfesional: number;
  nombreProfesional: string;
  razon: string;
  reportadoPor?: number;
}
