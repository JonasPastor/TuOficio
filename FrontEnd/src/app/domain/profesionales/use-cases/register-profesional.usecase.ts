import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfesionalRepository } from '../profesional.repository';
import { ProfesionalRequest } from '../profesional-request.model';

@Injectable({ providedIn: 'root' })
export class RegisterProfesionalUseCase {
  private readonly repository = inject(ProfesionalRepository);

  execute(request: ProfesionalRequest): Observable<any> {
    return this.repository.register(request);
  }
}
