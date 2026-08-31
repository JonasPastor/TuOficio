import { Observable } from 'rxjs';
import { UsuarioRequest, MetricasUsuarios, UsuarioMetrica, ProfesionalMetrica } from './usuario.model';
import { PerfilUsuario, PerfilUsuarioRequest, PerfilCliente } from './models/perfil.model';
import { PerfilProfesional } from '../profesionales/models/perfil-profesional.model';

export abstract class UsuarioRepository {
  abstract register(usuario: UsuarioRequest): Observable<any>;
  abstract login(email: string, password: string): Observable<any>;
  abstract getUserProfile(): Observable<any>;
  abstract updateProfile(usuario: Partial<UsuarioRequest>): Observable<any>;
  abstract getPerfilCliente(idUsuario: string): Observable<PerfilUsuario>;
  abstract updatePerfilCliente(idUsuario: string, perfil: PerfilUsuarioRequest): Observable<any>;
  abstract updateAvatar(idAuth: number, avatarUrl: string): Observable<any>;
  abstract getAvatar(idAuth: number): Observable<string>;
  abstract getMetricasUsuarios(): Observable<MetricasUsuarios>;
  abstract getUsuariosMetrica(limit?: number, offset?: number): Observable<UsuarioMetrica[]>;
  abstract getProfesionalesMetrica(limit?: number, offset?: number): Observable<ProfesionalMetrica[]>;
  abstract buscarClientesPorNombre(nombre: string): Observable<PerfilCliente[]>;
  abstract buscarProfesionalesPorNombre(nombre: string): Observable<PerfilProfesional[]>;
  abstract agregarStrike(email: string, motivo: string): Observable<string>;
}
