import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudRepository } from '../solicitud.repository';
import { SolicitudResponse } from '../solicitud.model';

@Injectable({ providedIn: 'root' })
export class GetSolicitudesUseCase {
  private readonly repository = inject(SolicitudRepository);

  execute(idProfesional: number, estado: string): Observable<SolicitudResponse[]> {
    return this.repository.getSolicitud(idProfesional, estado);
  }
}
