import { Routes } from '@angular/router';

export const PAGOS_ROUTES: Routes = [
  {
    path: 'exitoso',
    loadComponent: () => import('./pago-exitoso/pago-exitoso.component').then(m => m.PagoExitosoComponent)
  },
  {
    path: 'fallido',
    loadComponent: () => import('./pago-fallido/pago-fallido.component').then(m => m.PagoFallidoComponent)
  },
  {
    path: 'pendiente',
    loadComponent: () => import('./pago-pendiente/pago-pendiente.component').then(m => m.PagoPendienteComponent)
  }
];
