// 📁 src/app/domain/resenias/resenia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReseniaRequest {
  idUsuario: number;
  idProfesional: number;
  idTrabajo: number;
  puntuacion: number;
  comentario: string;
}

export interface ReseniaResponse {
  nombreUsuario: string;
  nombreProfesional: string;
  fecha: string;
  puntuacion: number;
  comentario: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReseniaService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/resenias`;

  constructor(private http: HttpClient) {}

  puntuarResenia(request: ReseniaRequest): Observable<ReseniaResponse> {
    return this.http.post<ReseniaResponse>(`${this.apiUrl}/puntuar/`, request);
  }
}
