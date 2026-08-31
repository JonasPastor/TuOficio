import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfesionalRepository } from '../profesional.repository';
import { PerfilProfesional } from '../models/perfil-profesional.model';

@Injectable({ providedIn: 'root' })
export class GetProfesionalesMasSolicitadosUseCase {
  private readonly repository = inject(ProfesionalRepository);

  execute(): Observable<PerfilProfesional[]> {
    return this.repository.getProfesionalesMasSolicitados();
  }
}
