import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrabajoRepository } from './trabajo.repository';
import { Trabajo, TrabajoResponse, FinalizarTrabajoRequest, TrabajoClienteResponse } from './trabajo.model';

@Injectable({ providedIn: 'root' })
export class TrabajoService {
  private readonly repository = inject(TrabajoRepository);

  crearTrabajo(idSolicitud: number): Observable<Trabajo> {
    return this.repository.crearTrabajo(idSolicitud);
  }

  iniciarTrabajo(idTrabajo: number): Observable<TrabajoResponse> {
    return this.repository.iniciarTrabajo(idTrabajo);
  }

  pausarTrabajo(idTrabajo: number): Observable<TrabajoResponse> {
    return this.repository.pausarTrabajo(idTrabajo);
  }

  reanudarTrabajo(idTrabajo: number): Observable<TrabajoResponse> {
    return this.repository.reanudarTrabajo(idTrabajo);
  }

  finalizarTrabajo(idTrabajo: number, observaciones: string, montoFinal: number, duracionReal?: number, montoAdicional?: number, descripcionAdicional?: string, fotoTrabajo?: string): Observable<TrabajoResponse> {
    const request: FinalizarTrabajoRequest = {
      observaciones,
      montoFinal,
      duracionReal: duracionReal || null,
      montoAdicional: montoAdicional || null,
      descripcionAdicional: descripcionAdicional || null,
      fotoTrabajo: fotoTrabajo || null
    };
    return this.repository.finalizarTrabajo(idTrabajo, request);
  }

  cancelarTrabajo(idTrabajo: number, motivo: string): Observable<TrabajoResponse> {
    return this.repository.cancelarTrabajo(idTrabajo, motivo);
  }

  obtenerTrabajo(idTrabajo: number): Observable<TrabajoResponse> {
    return this.repository.obtenerTrabajo(idTrabajo);
  }

  obtenerTrabajoPorSolicitud(idSolicitud: number): Observable<TrabajoResponse> {
    return this.repository.obtenerTrabajoPorSolicitud(idSolicitud);
  }

  obtenerTrabajosPorProfesional(idProfesional: number, estado?: string): Observable<TrabajoResponse[]> {
    return this.repository.obtenerTrabajosPorProfesional(idProfesional, estado);
  }

  obtenerTrabajosPorUsuario(idUsuario: number, estado?: string): Observable<TrabajoResponse[]> {
    return this.repository.obtenerTrabajosPorUsuario(idUsuario, estado);
  }

  obtenerTrabajosSinFactura(): Observable<TrabajoResponse[]> {
    return this.repository.obtenerTrabajosSinFactura();
  }

  obtenerTrabajosFinalizadosPorCliente(idUsuario: number): Observable<TrabajoClienteResponse[]> {
    return this.repository.obtenerTrabajosFinalizadosPorCliente(idUsuario);
  }
}
