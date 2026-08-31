import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FotoGaleria } from '../profesionales/models/perfil-profesional.model';

@Injectable({
  providedIn: 'root'
})
export class FotoGaleriaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/galeria`;

  getFotosByProfesional(idProfesional: number): Observable<FotoGaleria[]> {
    return this.http.get<FotoGaleria[]>(`${this.baseUrl}/profesional/${idProfesional}`);
  }

  agregarFoto(idProfesional: number, foto: FotoGaleria): Observable<FotoGaleria> {
    return this.http.post<FotoGaleria>(`${this.baseUrl}/profesional/${idProfesional}`, foto);
  }

  eliminarFoto(idProfesional: number, idFoto: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/profesional/${idProfesional}/foto/${idFoto}`);
  }
}
