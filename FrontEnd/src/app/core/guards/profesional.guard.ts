import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../domain/auth/auth.service';

export const profesionalGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (!user?.idProfesional) {
    // Usuario autenticado pero no es profesional
    console.warn('Acceso denegado: El usuario no es un profesional');
    router.navigate(['/home']);
    return false;
  }

  return true;
};
