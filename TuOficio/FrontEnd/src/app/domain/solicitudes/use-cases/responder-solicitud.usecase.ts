import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudRepository } from '../solicitud.repository';

@Injectable({ providedIn: 'root' })
export class ResponderSolicitudUseCase {
  private readonly repository = inject(SolicitudRepository);

  execute(idSolicitud: number, aceptada: boolean): Observable<any> {
    return this.repository.responderSolicitud(idSolicitud, aceptada);
  }
}
