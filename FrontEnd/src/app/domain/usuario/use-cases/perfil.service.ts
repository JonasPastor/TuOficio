import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioRepository } from '../usuario.repository';
import { PerfilUsuario, PerfilUsuarioRequest } from '../models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly usuarioRepository = inject(UsuarioRepository);

  obtenerPerfil(idUsuario: string): Observable<PerfilUsuario> {
    return this.usuarioRepository.getPerfilCliente(idUsuario);
  }

  actualizarPerfil(idUsuario: string, perfil: PerfilUsuarioRequest): Observable<any> {
    return this.usuarioRepository.updatePerfilCliente(idUsuario, perfil);
  }

  actualizarAvatar(idAuth: number, avatarUrl: string): Observable<any> {
    return this.usuarioRepository.updateAvatar(idAuth, avatarUrl);
  }

  obtenerAvatar(idAuth: number): Observable<string> {
    return this.usuarioRepository.getAvatar(idAuth);
  }
}
