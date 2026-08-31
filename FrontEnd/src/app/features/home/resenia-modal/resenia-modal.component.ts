// 📁 src/app/features/home/resenia-modal/resenia-modal.component.ts
import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X, Star, Send } from 'lucide-angular';
import { ReseniaService, ReseniaRequest } from '../../../domain/resenias/resenia.service';

@Component({
  selector: 'app-resenia-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="modal-overlay" (click)="cerrarModal()">
      <div class="modal-content resenia-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Califica tu experiencia</h2>
          <button type="button" class="close-btn" (click)="cerrarModal(); $event.stopPropagation()">
            <lucide-angular [img]="X" size="24"></lucide-angular>
          </button>
        </div>

        <div class="modal-body">
          <div class="professional-info">
            <h3>{{ nombreProfesional }}</h3>
            <p class="subtitle">¿Cómo fue tu experiencia con este profesional?</p>
          </div>

          <form [formGroup]="reseniaForm" (ngSubmit)="enviarResenia()">
            <!-- Rating Stars -->
            <div class="form-group">
              <label>Calificación *</label>
              <div class="star-rating">
                <button
                  *ngFor="let star of [1, 2, 3, 4, 5]"
                  type="button"
                  class="star-btn"
                  [class.active]="star <= puntuacionSeleccionada()"
                  (click)="seleccionarPuntuacion(star)"
                >
                  <lucide-angular [img]="Star" [size]="32"></lucide-angular>
                </button>
              </div>
              <div *ngIf="puntuacionSeleccionada() > 0" class="rating-text">
                {{ getRatingText() }}
              </div>
              <div *ngIf="reseniaForm.get('puntuacion')?.invalid && reseniaForm.get('puntuacion')?.touched" class="error-message">
                Por favor selecciona una calificación
              </div>
            </div>

            <!-- Comentario -->
            <div class="form-group">
              <label for="comentario">Comentario *</label>
              <textarea
                id="comentario"
                formControlName="comentario"
                rows="4"
                placeholder="Cuéntanos sobre tu experiencia..."
                class="form-control"
              ></textarea>
              <div *ngIf="reseniaForm.get('comentario')?.invalid && reseniaForm.get('comentario')?.touched" class="error-message">
                El comentario debe tener al menos 10 caracteres
              </div>
            </div>

            <!-- Error/Success Messages -->
            <div *ngIf="errorMessage()" class="alert alert-error">
              {{ errorMessage() }}
            </div>

            <div *ngIf="successMessage()" class="alert alert-success">
              ¡Gracias por tu reseña!
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="cerrarModal(); $event.stopPropagation()"
                [disabled]="isSubmitting()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="reseniaForm.invalid || isSubmitting()"
              >
                <lucide-angular *ngIf="!isSubmitting()" [img]="Send" size="18"></lucide-angular>
                <span>{{ isSubmitting() ? 'Enviando...' : 'Enviar Reseña' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2001;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .resenia-modal {
      max-width: 500px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: #0d6efd;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    }

    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #ffffff;
      transition: all 0.2s;
      padding: 0;
      pointer-events: auto;
      z-index: 10;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.1);
    }

    .modal-body {
      padding: 1.5rem;
      background: rgba(26, 32, 44, 0.02);
    }

    .professional-info {
      text-align: center;
      margin-bottom: 2rem;
    }

    .professional-info h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6b7280;
      font-size: 0.95rem;
    }

    .star-rating {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin: 1rem 0;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #d1d5db;
      transition: all 0.2s;
      padding: 0.25rem;
    }

    .star-btn:hover {
      transform: scale(1.1);
    }

    .star-btn.active {
      color: #fbbf24;
    }

    .star-btn.active :host ::ng-deep svg {
      fill: currentColor;
    }

    .rating-text {
      text-align: center;
      font-weight: 600;
      color: #1f2937;
      margin-top: 0.5rem;
      font-size: 1.1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      resize: vertical;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alert-error {
      background-color: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .alert-success {
      background-color: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      pointer-events: auto;
    }

    .btn-secondary {
      background-color: #f3f4f6;
      color: #374151;
      pointer-events: auto;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #e5e7eb;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ReseniaModalComponent {
  @Input({ required: true }) idUsuario!: number;
  @Input({ required: true }) idProfesional!: number;
  @Input({ required: true }) idTrabajo!: number;
  @Input({ required: true }) nombreProfesional!: string;
  @Output() close = new EventEmitter<void>();
  @Output() reseniaEnviada = new EventEmitter<void>();

  readonly X = X;
  readonly Star = Star;
  readonly Send = Send;

  private readonly fb = inject(FormBuilder);
  private readonly reseniaService = inject(ReseniaService);

  reseniaForm: FormGroup;
  puntuacionSeleccionada = signal(0);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal(false);

  constructor() {
    this.reseniaForm = this.fb.group({
      puntuacion: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  seleccionarPuntuacion(puntuacion: number): void {
    this.puntuacionSeleccionada.set(puntuacion);
    this.reseniaForm.patchValue({ puntuacion });
  }

  cerrarModal(): void {
    console.log('🔴 Cerrando modal de reseña');
    console.log('🔴 Emitiendo evento close...');
    this.close.emit();
    console.log('🔴 Evento close emitido');
  }

  getRatingText(): string {
    const ratings = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
    return ratings[this.puntuacionSeleccionada()];
  }

  enviarResenia(): void {
    if (this.reseniaForm.invalid) {
      Object.keys(this.reseniaForm.controls).forEach(key => {
        this.reseniaForm.get(key)?.markAsTouched();
      });
      return;
    }

    console.log('🔍 Inputs del componente:', {
      idUsuario: this.idUsuario,
      idProfesional: this.idProfesional,
      idTrabajo: this.idTrabajo,
      nombreProfesional: this.nombreProfesional
    });

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const request: ReseniaRequest = {
      idUsuario: this.idUsuario,
      idProfesional: this.idProfesional,
      idTrabajo: this.idTrabajo,
      puntuacion: this.reseniaForm.value.puntuacion,
      comentario: this.reseniaForm.value.comentario
    };
    console.log('Enviando reseña:', request);

    this.reseniaService.puntuarResenia(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(true);
        this.reseniaEnviada.emit();
        setTimeout(() => {
          this.close.emit();
        }, 2000);
      },
      error: (error: any) => {
        console.error('Error al enviar reseña:', error);
        this.isSubmitting.set(false);
        this.errorMessage.set('Error al enviar la reseña. Por favor, intenta nuevamente.');
      }
    });
  }
}
