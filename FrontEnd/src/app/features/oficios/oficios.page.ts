import { AsyncPipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ListOficiosUseCase } from '../../domain/oficios/use-cases/list-oficios.usecase';

@Component({
  selector: 'app-oficios-page',
  standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, TitleCasePipe],
  template: `
    <section class="container p-3">
      <h1>Oficios</h1>
      <ul>
        <li *ngFor="let o of oficios$ | async">
          <strong>{{ o.oficio | titlecase }}</strong>
          <small class="text-muted" *ngIf="o.descripcion"> — {{ o.descripcion }}</small>
        </li>
      </ul>
    </section>
  `,
})
export class OficiosPage {
  private readonly listUseCase = inject(ListOficiosUseCase);
  readonly oficios$ = this.listUseCase.execute();
}
