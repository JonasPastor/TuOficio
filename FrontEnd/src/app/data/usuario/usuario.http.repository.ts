import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioRepository } from '../../domain/usuario/usuario.repository';
import { UsuarioRequest, MetricasUsuarios, UsuarioMetrica, ProfesionalMetrica } from '../../domain/usuario/usuario.model';
import { PerfilUsuario, PerfilUsuarioRequest, PerfilCliente } from '../../domain/usuario/models/perfil.model';
import { PerfilProfesional } from '../../domain/profesionales/models/perfil-profesional.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioHttpRepository implements UsuarioRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  register(usuario: UsuarioRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/register`, usuario);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/login`, { email, password });
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios/profile`);
  }

  updateProfile(usuario: Partial<UsuarioRequest>): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/profile`, usuario);
  }

  getPerfilCliente(idUsuario: string): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.baseUrl}/perfil/cliente/${idUsuario}`);
  }

  updatePerfilCliente(idUsuario: string, perfil: PerfilUsuarioRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/perfil/cliente`, perfil);
  }

  updateAvatar(idAuth: number, avatarUrl: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/perfil/avatar/${idAuth}`, avatarUrl, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getAvatar(idAuth: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/perfil/avatar/${idAuth}`, { responseType: 'text' });
  }

  getMetricasUsuarios(): Observable<MetricasUsuarios> {
    return this.http.get<MetricasUsuarios>(`${this.baseUrl}/perfil/metrica/usuarios-registrados`);
  }

  getUsuariosMetrica(limit?: number, offset?: number): Observable<UsuarioMetrica[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }
    return this.http.get<UsuarioMetrica[]>(`${this.baseUrl}/perfil/metrica/usuarios`, { params });
  }

  getProfesionalesMetrica(limit?: number, offset?: number): Observable<ProfesionalMetrica[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined) {
      params = params.set('offset', offset.toString());
    }
    return this.http.get<ProfesionalMetrica[]>(`${this.baseUrl}/perfil/metrica/profesionales`, { params });
  }

  buscarClientesPorNombre(nombre: string): Observable<PerfilCliente[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<PerfilCliente[]>(`${this.baseUrl}/perfil/clientes/nombre`, { params });
  }

  buscarProfesionalesPorNombre(nombre: string): Observable<PerfilProfesional[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<PerfilProfesional[]>(`${this.baseUrl}/perfil/profesionales/nombre`, { params });
  }

  agregarStrike(email: string, motivo: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/perfil/strike/${encodeURIComponent(email)}`, motivo, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }
}
