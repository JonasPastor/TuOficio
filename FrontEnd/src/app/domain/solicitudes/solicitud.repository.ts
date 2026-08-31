import { Observable } from 'rxjs';
import { SolicitudRequest, SolicitudResponse, SolicitudConProfesional, TurnoDisponible, ConfirmarTurnoRequest, EstadisticaOficio } from './solicitud.model';

export abstract class SolicitudRepository {
  abstract enviarSolicitud(solicitud: SolicitudRequest): Observable<any>;
  abstract responderSolicitud(idSolicitud: number, aceptada: boolean): Observable<any>;
  abstract getSolicitud(idProfesional: number, estado: string): Observable<SolicitudResponse[]>;
  abstract getSolicitudesByUsuario(idUsuario: number): Observable<SolicitudConProfesional[]>;
  abstract verificarSolicitudPendiente(idUsuario: number, idProfesional: number): Observable<boolean>;
  abstract obtenerTurnosDisponiblesSemana(idProfesional: number, fechaInicio: string, duracion?: number): Observable<TurnoDisponible[]>;
  abstract confirmarTurno(request: ConfirmarTurnoRequest): Observable<SolicitudResponse>;
  abstract getOficiosMasSolicitados(fechaInicio?: string, fechaFin?: string): Observable<EstadisticaOficio[] | null>;
}
