import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TrabajoRepository } from '../../domain/trabajo/trabajo.repository';
import { Trabajo, TrabajoResponse, FinalizarTrabajoRequest, TrabajoClienteResponse } from '../../domain/trabajo/trabajo.model';

@Injectable({ providedIn: 'root' })
export class TrabajoHttpRepository implements TrabajoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/trabajos`;

  crearTrabajo(idSolicitud: number): Observable<Trabajo> {
    return this.http.post<Trabajo>(`${this.baseUrl}/crear/${idSolicitud}`, null);
  }

  iniciarTrabajo(idTrabajo: number): Observable<TrabajoResponse> {
    return this.http.put<TrabajoResponse>(`${this.baseUrl}/iniciar/${idTrabajo}`, null);
  }

  pausarTrabajo(idTrabajo: number): Observable<TrabajoResponse> {
    return this.http.put<TrabajoResponse>(`${this.baseUrl}/pausar/${idTrabajo}`, null);
  }

  reanudarTrabajo(idTrabajo: number): Observable<TrabajoResponse> {
    return this.http.put<TrabajoResponse>(`${this.baseUrl}/reanudar/${idTrabajo}`, null);
  }

  finalizarTrabajo(idTrabajo: number, request: FinalizarTrabajoRequest): Observable<TrabajoResponse> {
    return this.http.put<TrabajoResponse>(`${this.baseUrl}/finalizar/${idTrabajo}`, request);
  }

  cancelarTrabajo(idTrabajo: number, motivo: string): Observable<TrabajoResponse> {
    const params = new HttpParams().set('motivo', motivo);
    return this.http.put<TrabajoResponse>(`${this.baseUrl}/cancelar/${idTrabajo}`, null, { params });
  }

  obtenerTrabajo(idTrabajo: number): Observable<TrabajoResponse> {
    return this.http.get<TrabajoResponse>(`${this.baseUrl}/${idTrabajo}`);
  }

  obtenerTrabajoPorSolicitud(idSolicitud: number): Observable<TrabajoResponse> {
    return this.http.get<TrabajoResponse>(`${this.baseUrl}/solicitud/${idSolicitud}`);
  }

  obtenerTrabajosPorProfesional(idProfesional: number, estado?: string): Observable<TrabajoResponse[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<TrabajoResponse[]>(`${this.baseUrl}/profesional/${idProfesional}`, { params });
  }

  obtenerTrabajosPorUsuario(idUsuario: number, estado?: string): Observable<TrabajoResponse[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<TrabajoResponse[]>(`${this.baseUrl}/usuario/${idUsuario}`, { params });
  }

  obtenerTrabajosSinFactura(): Observable<TrabajoResponse[]> {
    return this.http.get<TrabajoResponse[]>(`${this.baseUrl}/sin-factura`);
  }

  obtenerTrabajosFinalizadosPorCliente(idUsuario: number): Observable<TrabajoClienteResponse[]> {
    return this.http.get<TrabajoClienteResponse[]>(`${this.baseUrl}/cliente/finalizados/${idUsuario}`);
  }
}
