import { Routes } from '@angular/router';
import { HomePage } from './home.page';
import { noAdminGuard } from '../../core/guards/no-admin.guard';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [noAdminGuard]
  },
];
