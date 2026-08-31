import { Routes } from '@angular/router';
import { profesionalGuard } from '../../core/guards/profesional.guard';
import { noAdminGuard } from '../../core/guards/no-admin.guard';

export const PROFESIONALES_ROUTES: Routes = [
  {
    path: 'perfil/:id',
    loadComponent: () => import('./perfil/perfil-profesional.component').then(m => m.PerfilProfesionalComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro-profesional').then(m => m.RegistroProfesional)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.ProfessionalDashboardComponent),
    canActivate: [noAdminGuard, profesionalGuard]
  },
  {
    path: 'facturas',
    loadComponent: () => import('./facturas/facturas.component').then(m => m.FacturasComponent),
    canActivate: [noAdminGuard, profesionalGuard]
  },
  {
    path: 'resenas',
    loadComponent: () => import('./resenas/resenas.component').then(m => m.ResenasComponent),
    canActivate: [noAdminGuard, profesionalGuard]
  },
  {
    path: 'metodos-pago',
    loadComponent: () => import('./metodos-pago/metodos-pago.component').then(m => m.MetodosPagoComponent),
    canActivate: [noAdminGuard, profesionalGuard]
  }
];
