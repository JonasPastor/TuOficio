import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../../domain/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  resetPasswordForm: FormGroup;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  constructor(private fb: FormBuilder) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      codigo: ['', [Validators.required]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Get email from query params if available
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.resetPasswordForm.patchValue({
          email: params['email']
        });
      }
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('nuevaPassword');
    const confirmPassword = control.get('confirmarPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(value => !value);
  }

  async onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const { email, codigo, nuevaPassword } = this.resetPasswordForm.value;

      this.authService.resetPassword(email, codigo, nuevaPassword).subscribe({
        next: (response) => {
          console.log('Contraseña restablecida exitosamente:', response);
          this.isLoading.set(false);
          this.successMessage.set('Contraseña restablecida exitosamente. Redirigiendo al inicio de sesión...');

          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error al restablecer contraseña:', error);
          this.isLoading.set(false);

          // Set user-friendly error message
          if (error.status === 400) {
            this.errorMessage.set('Código inválido o expirado. Solicita un nuevo código.');
          } else if (error.status === 404) {
            this.errorMessage.set('No se encontró una cuenta con ese correo electrónico.');
          } else if (error.status === 0) {
            this.errorMessage.set('No se pudo conectar al servidor. Intenta nuevamente.');
          } else {
            this.errorMessage.set(error.error?.detalle || 'Error al restablecer la contraseña. Intenta nuevamente.');
          }
        }
      });
    }
  }
}
