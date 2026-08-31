import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse, User, AuthState } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // Auth state using signals
  private authState = signal<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null
  });

  // Public readonly signals
  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<User | null>(null);

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Initialize auth state from localStorage
   */
  private initializeAuthState(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.updateAuthState({
          isAuthenticated: true,
          token,
          user
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthState();
      }
    }
  }

  /**
   * Update auth state and signals
   */
  private updateAuthState(state: AuthState): void {
    this.authState.set(state);
    this.isAuthenticated.set(state.isAuthenticated);
    this.currentUser.set(state.user);
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/api/v1/auth/login`, credentials, { headers })
      .pipe(
        tap(response => {
          // Map backend response to User model
          const user: User = {
            id: response.idUsuario,
            name: response.nombre,
            lastName: response.apellido,
            email: response.email,
            documento: response.documento,
            telefono: response.telefono,
            nacimiento: response.nacimiento,
            idDireccion: response.idDireccion,
            idProfesional: response.idProfesional,
            roles: response.roles,
            avatar: response.avatar || null
          };

          // Store token and user data
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));

          // Update auth state
          this.updateAuthState({
            isAuthenticated: true,
            token: response.token,
            user: user
          });
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Forgot password - request recovery code
   */
  forgotPassword(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/api/v1/password/forgot-password`, { email }, { headers })
      .pipe(
        catchError(error => {
          console.error('Forgot password error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Reset password with code
   */
  resetPassword(email: string, codigo: string, nuevaPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/api/v1/password/reset-password`,
      { email, codigo, nuevaPassword },
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Reset password error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Clear auth state and localStorage
   */
  private clearAuthState(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.updateAuthState({
      isAuthenticated: false,
      token: null,
      user: null
    });
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.authState().token;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authState().user;
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    return this.authState().isAuthenticated;
  }

  /**
   * Get user's full name
   */
  getUserFullName(): string {
    const user = this.getCurrentUser();
    return user ? `${user.name} ${user.lastName}` : '';
  }

  /**
   * Update user avatar in current session
   */
  updateUserAvatar(avatarUrl: string): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar: avatarUrl };
      localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
      
      this.updateAuthState({
        isAuthenticated: true,
        token: this.getToken(),
        user: updatedUser
      });
    }
  }

  /**
   * Get tipos de documentos
   */
  getTiposDocumento(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/v1/usuario/tipos-documento`)
      .pipe(
        catchError(error => {
          console.error('Error getting tipos documento:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Register new usuario
   */
  registerUsuario(usuarioData: any): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/api/v1/registro/usuario`, usuarioData, { headers })
      .pipe(
        catchError(error => {
          console.error('Register usuario error:', error);
          return throwError(() => error);
        })
      );
  }
}
