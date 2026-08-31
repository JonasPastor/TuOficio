import { Routes } from '@angular/router';
import { PerfilComponent } from './perfil/perfil.component';
import { authGuard } from '../../core/guards/auth.guard';

export const USUARIOS_ROUTES: Routes = [
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'perfil', pathMatch: 'full' }
];
