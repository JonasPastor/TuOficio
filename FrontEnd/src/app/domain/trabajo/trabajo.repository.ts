import { Observable } from 'rxjs';
import { Trabajo, TrabajoResponse, FinalizarTrabajoRequest, TrabajoClienteResponse } from './trabajo.model';

export abstract class TrabajoRepository {
  abstract crearTrabajo(idSolicitud: number): Observable<Trabajo>;
  abstract iniciarTrabajo(idTrabajo: number): Observable<TrabajoResponse>;
  abstract pausarTrabajo(idTrabajo: number): Observable<TrabajoResponse>;
  abstract reanudarTrabajo(idTrabajo: number): Observable<TrabajoResponse>;
  abstract finalizarTrabajo(idTrabajo: number, request: FinalizarTrabajoRequest): Observable<TrabajoResponse>;
  abstract cancelarTrabajo(idTrabajo: number, motivo: string): Observable<TrabajoResponse>;
  abstract obtenerTrabajo(idTrabajo: number): Observable<TrabajoResponse>;
  abstract obtenerTrabajoPorSolicitud(idSolicitud: number): Observable<TrabajoResponse>;
  abstract obtenerTrabajosPorProfesional(idProfesional: number, estado?: string): Observable<TrabajoResponse[]>;
  abstract obtenerTrabajosPorUsuario(idUsuario: number, estado?: string): Observable<TrabajoResponse[]>;
  abstract obtenerTrabajosSinFactura(): Observable<TrabajoResponse[]>;
  abstract obtenerTrabajosFinalizadosPorCliente(idUsuario: number): Observable<TrabajoClienteResponse[]>;
}
