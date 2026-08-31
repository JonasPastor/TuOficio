import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfesionalRepository } from '../profesional.repository';
import { PerfilProfesional } from '../models/perfil-profesional.model';

@Injectable({ providedIn: 'root' })
export class GetPerfilProfesionalUseCase {
  private readonly repository = inject(ProfesionalRepository);

  execute(idProfesional: number): Observable<PerfilProfesional> {
    return this.repository.getPerfilProfesional(idProfesional);
  }
}
