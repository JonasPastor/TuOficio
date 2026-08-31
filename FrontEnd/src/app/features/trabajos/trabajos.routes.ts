import { Routes } from '@angular/router';

export const TRABAJOS_ROUTES: Routes = [
  {
    path: 'finalizados',
    loadComponent: () =>
      import('./trabajos-finalizados.page').then((m) => m.TrabajosFinalizadosPage),
  },
];
