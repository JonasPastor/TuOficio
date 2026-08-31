import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterProfesionalUseCase } from '../../../domain/profesionales/use-cases/register-profesional.usecase';
import { ListOficiosUseCase } from '../../../domain/oficios/use-cases/list-oficios.usecase';
import { Oficio } from '../../../domain/oficios/oficio.model';
import { AuthService } from '../../../domain/auth';
import { ProfesionalRequest } from '../../../domain/profesionales/profesional-request.model';

@Component({
  selector: 'app-registro-profesional',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registro-profesional.html',
  styleUrl: './registro-profesional.scss'
})
export class RegistroProfesional implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly registerUseCase = inject(RegisterProfesionalUseCase);
  private readonly listOficiosUseCase = inject(ListOficiosUseCase);
  private readonly authService = inject(AuthService);

  registroForm!: FormGroup;
  oficios = signal<Oficio[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  newEspecialidad = signal('');
  stillWorking = signal(true); // Controla si aún ejerce el oficio
  
  // Modales
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  modalMessage = signal('');

  ngOnInit(): void {
    this.initForm();
    this.loadOficios();
  }

  private initForm(): void {
    const currentUser = this.authService.getCurrentUser();

    this.registroForm = this.fb.group({
      idUsuario: [currentUser?.id || null, [Validators.required]],
      fechaDesde: ['', [Validators.required]],
      fechaHasta: [null],
      idOficio: ['', [Validators.required]],
      precioMin: ['', [Validators.required, Validators.min(0)]],
      precioMax: ['', [Validators.required, Validators.min(0)]],
      especialidades: this.fb.array([], [Validators.required])
    }, { validators: this.priceRangeValidator });
  }

  // Validador personalizado para verificar que precioMax > precioMin
  private priceRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const min = group.get('precioMin')?.value;
    const max = group.get('precioMax')?.value;

    if (min && max && Number(max) <= Number(min)) {
      return { invalidPriceRange: true };
    }
    return null;
  }

  get especialidades(): FormArray {
    return this.registroForm.get('especialidades') as FormArray;
  }

  private loadOficios(): void {
    this.listOficiosUseCase.execute().subscribe({
      next: (oficios) => {
        this.oficios.set(oficios);
      },
      error: (error) => {
        console.error('Error loading oficios:', error);
        this.errorMessage.set('Error al cargar los oficios disponibles');
      }
    });
  }

  onStillWorkingChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.stillWorking.set(checkbox.checked);

    if (checkbox.checked) {
      this.registroForm.patchValue({ fechaHasta: null });
      this.registroForm.get('fechaHasta')?.clearValidators();
    } else {
      this.registroForm.get('fechaHasta')?.setValidators([Validators.required]);
    }
    this.registroForm.get('fechaHasta')?.updateValueAndValidity();
  }

  addEspecialidad(): void {
    const especialidad = this.newEspecialidad().trim();

    if (!especialidad) {
      return;
    }

    // Verificar que no exista ya
    const exists = this.especialidades.controls.some(
      control => control.value.toLowerCase() === especialidad.toLowerCase()
    );

    if (exists) {
      this.errorMessage.set('Esta especialidad ya fue agregada');
      setTimeout(() => this.errorMessage.set(null), 3000);
      return;
    }

    this.especialidades.push(this.fb.control(especialidad));
    this.newEspecialidad.set('');
  }

  removeEspecialidad(index: number): void {
    this.especialidades.removeAt(index);
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.markFormGroupTouched(this.registroForm);

      if (this.registroForm.hasError('invalidPriceRange')) {
        this.errorMessage.set('El precio máximo debe ser mayor al precio mínimo');
      } else if (this.especialidades.length === 0) {
        this.errorMessage.set('Debe agregar al menos una especialidad');
      } else {
        this.errorMessage.set('Por favor, complete todos los campos requeridos');
      }
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.registroForm.value;
    const request: ProfesionalRequest = {
      idUsuario: formValue.idUsuario,
      fechaDesde: formValue.fechaDesde,
      fechaHasta: formValue.fechaHasta,
      idOficio: Number(formValue.idOficio),
      precioMin: Number(formValue.precioMin),
      precioMax: Number(formValue.precioMax),
      especialidades: formValue.especialidades
    };

    this.registerUseCase.execute(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.modalMessage.set('¡Registro exitoso! Has sido registrado como profesional. Serás redirigido al inicio.');
        this.showSuccessModal.set(true);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error registering professional:', error);
        const errorMsg = error.error?.message || 'Error al registrar como profesional. Por favor, intente nuevamente.';
        this.modalMessage.set(errorMsg);
        this.showErrorModal.set(true);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(c => c.markAsTouched());
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registroForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registroForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }

    return '';
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/home']);
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }
}
