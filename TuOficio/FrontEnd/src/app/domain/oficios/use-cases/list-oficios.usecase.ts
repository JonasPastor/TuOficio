import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Oficio } from '../oficio.model';
import { OficioRepository } from '../oficio.repository';

@Injectable({ providedIn: 'root' })
export class ListOficiosUseCase {
  private readonly repo = inject(OficioRepository);

  execute(): Observable<Oficio[]> {
    return this.repo.list();
  }
}
