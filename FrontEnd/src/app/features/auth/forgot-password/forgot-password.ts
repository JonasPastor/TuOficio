import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Mail } from 'lucide-angular';
import { AuthService } from '../../../domain/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  readonly ArrowLeft = ArrowLeft;
  readonly Mail = Mail;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  forgotPasswordForm: FormGroup;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          console.log('Código enviado exitosamente:', response);
          this.isLoading.set(false);
          this.successMessage.set('Se ha enviado un código de recuperación a tu correo electrónico.');

          // Redirect to reset password page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/reset-password'], {
              queryParams: { email: email }
            });
          }, 2000);
        },
        error: (error) => {
          console.error('Error al enviar código:', error);
          this.isLoading.set(false);

          // Set user-friendly error message
          if (error.status === 404) {
            this.errorMessage.set('No se encontró una cuenta con ese correo electrónico.');
          } else if (error.status === 0) {
            this.errorMessage.set('No se pudo conectar al servidor. Intenta nuevamente.');
          } else {
            this.errorMessage.set(error.error?.detalle || 'Error al enviar el código. Intenta nuevamente.');
          }
        }
      });
    }
  }
}
