import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../domain/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if user has ADMINISTRADOR role
  if (currentUser && currentUser.roles.includes('ADMINISTRADOR')) {
    return true;
  }

  // Redirect to home if not admin
  router.navigate(['/']);
  return false;
};
