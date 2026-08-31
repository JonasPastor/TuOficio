import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfesionalRepository } from '../profesional.repository';
import { PerfilProfesional } from '../models/perfil-profesional.model';

@Injectable({ providedIn: 'root' })
export class GetProfesionalesByOficioUseCase {
  private readonly repository = inject(ProfesionalRepository);

  execute(oficio: string): Observable<PerfilProfesional[]> {
    return this.repository.getProfesionalesByOficio(oficio);
  }
}
