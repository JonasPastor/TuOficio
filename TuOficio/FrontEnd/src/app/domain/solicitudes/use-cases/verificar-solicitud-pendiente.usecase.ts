import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudRepository } from '../solicitud.repository';

@Injectable({ providedIn: 'root' })
export class VerificarSolicitudPendienteUseCase {
  private readonly repository = inject(SolicitudRepository);

  execute(idUsuario: number, idProfesional: number): Observable<boolean> {
    return this.repository.verificarSolicitudPendiente(idUsuario, idProfesional);
  }
}
