import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../domain/auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Lista de endpoints públicos que no requieren autenticación
      const publicEndpoints = [
        '/api/v1/auth/',
        '/api/v1/registro/',
        '/api/v1/domicilios/',
        '/api/v1/usuario/tipos-documento',
        '/api/v1/oficios/all',
        '/api/v1/perfil/profesional/oficio/',
        '/api/v1/password/'
      ];

      // Verificar si la URL es un endpoint público
      const isPublicEndpoint = publicEndpoints.some(endpoint =>
        req.url.includes(endpoint)
      );

      // Solo redirigir al login si:
      // 1. Es un error 401 o 403
      // 2. NO es un endpoint público
      if ((error.status === 401 || error.status === 403) && !isPublicEndpoint) {
        // Limpiar la sesión y redirigir al login
        authService.logout();
        console.log('Token expirado o inválido, redirigiendo al login');
      }

      // Para endpoints públicos con error 404, solo mostrar el error sin redirigir
      if (error.status === 404 && isPublicEndpoint) {
        console.warn('Recurso no encontrado:', req.url);
      }

      return throwError(() => error);
    })
  );
};
