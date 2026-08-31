import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Resena {
  id: number;
  cliente: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  servicio: string;
}

interface ReseniaBackend {
  id: number;
  nombreUsuario: string;
  puntuacion: number;
  comentario: string;
  fecha: string;
  servicio: string;
}

@Injectable({ providedIn: 'root' })
export class ResenaHttpRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/resenias`; // ← CORREGIDO

  getPromedioProfesional(idProfesional: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/promedio/${idProfesional}`);
  }

  getReseniasDeProfesional(idProfesional: number): Observable<Resena[]> {
    return this.http.get<ReseniaBackend[]>(`${this.baseUrl}/resenas/${idProfesional}`)
      .pipe(
        map(resenas => resenas.map(r => ({
          id: r.id,
          cliente: r.nombreUsuario,
          calificacion: r.puntuacion,
          comentario: r.comentario,
          fecha: r.fecha,
          servicio: r.servicio
        })))
      );
  }
}