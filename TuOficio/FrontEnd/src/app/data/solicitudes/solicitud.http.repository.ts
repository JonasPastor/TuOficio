import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { SolicitudRepository } from '../../domain/solicitudes/solicitud.repository';
import { SolicitudRequest, SolicitudResponse, SolicitudConProfesional, TurnoDisponible, ConfirmarTurnoRequest, EstadisticaOficio } from '../../domain/solicitudes/solicitud.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SolicitudHttpRepository implements SolicitudRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/solicitudes`;

  enviarSolicitud(solicitud: SolicitudRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/enviar/`, solicitud);
  }

  responderSolicitud(idSolicitud: number, aceptada: boolean): Observable<any> {
    const params = new HttpParams().set('aceptada', aceptada.toString());
    return this.http.put(`${this.baseUrl}/responder/${idSolicitud}`, null, {
      params,
      responseType: 'text'
    });
  }

  getSolicitud(idProfesional: number, estado: string): Observable<SolicitudResponse[]> {
    return this.http.get<SolicitudResponse[]>(`${this.baseUrl}/solicitud/${idProfesional}/${estado}`, {
      observe: 'response'
    }).pipe(
      map(response => {
        // Si el status es 204 (No Content), retornar array vacío
        if (response.status === 204 || !response.body) {
          return [];
        }
        return response.body;
      }),
      catchError(error => {
        // Si hay error 404 o cualquier otro, retornar array vacío
        console.log('No hay solicitudes disponibles:', error.status);
        return of([]);
      })
    );
  }

  getSolicitudesByUsuario(idUsuario: number): Observable<SolicitudConProfesional[]> {
    return this.http.get<SolicitudConProfesional[]>(`${this.baseUrl}/usuario/${idUsuario}`);
  }

  verificarSolicitudPendiente(idUsuario: number, idProfesional: number): Observable<boolean> {
    const params = new HttpParams()
      .set('idUsuario', idUsuario.toString())
      .set('idProfesional', idProfesional.toString());

    return this.http.get<{ tieneSolicitudPendiente: boolean }>(
      `${this.baseUrl}/verificar-pendiente`,
      { params }
    ).pipe(
      map(response => response.tieneSolicitudPendiente),
      catchError(() => of(false))
    );
  }

  obtenerTurnosDisponiblesSemana(idProfesional: number, fechaInicio: string, duracion: number = 60): Observable<TurnoDisponible[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('duracion', duracion.toString());

    return this.http.get<TurnoDisponible[]>(
      `${this.baseUrl}/turnos/disponibles/semana/${idProfesional}`,
      { params }
    ).pipe(
      catchError(() => of([]))
    );
  }

  confirmarTurno(request: ConfirmarTurnoRequest): Observable<SolicitudResponse> {
    const params = new HttpParams()
      .set('idUsuario', request.idUsuario.toString())
      .set('idProfesional', request.idProfesional.toString())
      .set('fecha', request.fecha)
      .set('hora', request.hora)
      .set('duracion', request.duracion.toString());

    const finalParams = request.observacion
      ? params.set('observacion', request.observacion)
      : params;

    return this.http.post<SolicitudResponse>(
      `${this.baseUrl}/turnos/confirmar`,
      null,
      { params: finalParams }
    );
  }

  getOficiosMasSolicitados(fechaInicio?: string, fechaFin?: string): Observable<EstadisticaOficio[] | null> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<EstadisticaOficio[]>(
      `${this.baseUrl}/estadisticas/oficios-mas-solicitados`,
      { params }
    ).pipe(
      catchError(() => of(null))
    );
  }
}
