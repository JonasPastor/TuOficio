import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Departamento, Ciudad, Barrio } from './domicilio.model';

@Injectable({
  providedIn: 'root'
})
export class DomicilioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtener todos los departamentos
   */
  getAllDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.apiUrl}/api/v1/domicilios/departamentos/all`);
  }

  /**
   * Obtener todas las ciudades
   */
  getAllCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.apiUrl}/api/v1/domicilios/ciudades/all`);
  }

  /**
   * Obtener todos los barrios
   */
  getAllBarrios(): Observable<Barrio[]> {
    return this.http.get<Barrio[]>(`${this.apiUrl}/api/v1/domicilios/barrios/all`);
  }

  /**
   * Obtener ciudades por departamento
   */
  getCiudadesByDepartamento(departamentoId: number): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.apiUrl}/api/v1/domicilios/ciudad/departamento/${departamentoId}`);
  }

  /**
   * Obtener barrios por ciudad
   */
  getBarriosByCiudad(ciudadId: number): Observable<Barrio[]> {
    return this.http.get<Barrio[]>(`${this.apiUrl}/api/v1/domicilios/barrio/ciudad/${ciudadId}`);
  }
}
