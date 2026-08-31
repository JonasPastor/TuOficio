// 📁 src/app/domain/solicitudes/solicitud.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SolicitudDetalle {
  id: number;
  idUsuario: number;
  idProfesional: number;
  fechasolicitud: string;
  fechaservicio: string;
  observacion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/solicitudes`;

  constructor(private http: HttpClient) {}

  getSolicitudById(idSolicitud: number): Observable<SolicitudDetalle> {
    return this.http.get<SolicitudDetalle>(`${this.apiUrl}/${idSolicitud}`);
  }
}