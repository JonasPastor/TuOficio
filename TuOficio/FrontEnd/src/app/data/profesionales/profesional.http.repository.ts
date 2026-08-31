import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfesionalRepository } from '../../domain/profesionales/profesional.repository';
import { ProfesionalRequest } from '../../domain/profesionales/profesional-request.model';
import { PerfilProfesional } from '../../domain/profesionales/models/perfil-profesional.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfesionalHttpRepository implements ProfesionalRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  register(request: ProfesionalRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/registro/profesional`, request);
  }

  getProfesionalesByOficio(oficio: string): Observable<PerfilProfesional[]> {
    const params = new HttpParams().set('oficio', oficio);
    return this.http.get<PerfilProfesional[]>(`${this.baseUrl}/perfil/profesionales/oficio`, { params });
  }

  getProfesionalesMasSolicitados(): Observable<PerfilProfesional[]> {
    return this.http.get<PerfilProfesional[]>(`${this.baseUrl}/solicitudes/profesionales/mas-solicitados`);
  }

  getPerfilProfesional(idProfesional: number): Observable<PerfilProfesional> {
    return this.http.get<PerfilProfesional>(`${this.baseUrl}/perfil/profesionales/${idProfesional}`);
  }
}
