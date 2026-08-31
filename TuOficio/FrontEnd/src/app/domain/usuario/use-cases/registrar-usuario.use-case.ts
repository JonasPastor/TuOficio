import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioRepository } from '../usuario.repository';
import { UsuarioRequest } from '../usuario.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrarUsuarioUseCase {
  constructor(private usuarioRepository: UsuarioRepository) {}

  execute(usuario: UsuarioRequest): Observable<any> {
    return this.usuarioRepository.register(usuario);
  }
}
