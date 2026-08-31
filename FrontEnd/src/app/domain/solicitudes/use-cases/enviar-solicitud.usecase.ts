import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudRepository } from '../solicitud.repository';
import { SolicitudRequest } from '../solicitud.model';

@Injectable({ providedIn: 'root' })
export class EnviarSolicitudUseCase {
  private readonly repository = inject(SolicitudRepository);

  execute(solicitud: SolicitudRequest): Observable<any> {
    return this.repository.enviarSolicitud(solicitud);
  }
}
