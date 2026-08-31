import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-angular';
import { AuthService, LoginRequest } from '../../../domain/auth';
import { RoleSelectionModalComponent } from '../../../shared/components/role-selection-modal/role-selection-modal.component';


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, RouterModule, RoleSelectionModalComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly ArrowRight = ArrowRight;

  showPassword = signal(false);
  isLoading = signal(false);
  loginError = signal<string | null>(null);
  showRoleModal = signal(false);
  loginForm: FormGroup;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.loginError.set(null);

      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading.set(false);

          // Check if user is ADMINISTRADOR
          if (response.roles.includes('ADMINISTRADOR')) {
            // Navigate to admin dashboard
            this.router.navigate(['/admin']);
          }
          // Check if user has both CLIENTE and PROFESIONAL roles
          else if (response.roles.includes('CLIENTE') && response.roles.includes('PROFESIONAL')) {
            // Show role selection modal
            this.showRoleModal.set(true);
          }
          // Check if user is only PROFESIONAL
          else if (response.roles.includes('PROFESIONAL')) {
            // Navigate to professional dashboard
            this.router.navigate(['/profesionales/dashboard']);
          }
          // Default to home page for CLIENTE
          else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.isLoading.set(false);

          // Set user-friendly error message
          if (error.status === 401) {
            this.loginError.set('Credenciales inválidas. Verifica tu email y contraseña.');
          } else if (error.status === 0) {
            this.loginError.set('No se pudo conectar al servidor. Intenta nuevamente.');
          } else {
            this.loginError.set('Error al iniciar sesión. Intenta nuevamente.');
          }
        }
      });
    }
  }

  onRoleSelected(role: 'cliente' | 'profesional') {
    this.showRoleModal.set(false);

    if (role === 'profesional') {
      // Navigate to professional dashboard
      this.router.navigate(['/profesionales/dashboard']);
    } else {
      // Navigate to home page
      this.router.navigate(['/']);
    }
  }
}
