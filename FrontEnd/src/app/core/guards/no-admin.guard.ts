import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../domain/auth';

export const noAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if user is ADMINISTRADOR
  if (currentUser && currentUser.roles.includes('ADMINISTRADOR')) {
    // Redirect admin to admin panel
    router.navigate(['/admin']);
    return false;
  }

  // Allow access for non-admin users
  return true;
};
