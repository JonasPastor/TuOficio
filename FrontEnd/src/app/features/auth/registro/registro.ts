import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../../domain/auth/auth.service';
import { DomicilioService } from '../../../domain/domicilio/domicilio.service';
import { Departamento, Ciudad, Barrio } from '../../../domain/domicilio/domicilio.model';
import { TipoDocumento } from '../../../domain/auth/auth.model';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro implements OnInit {
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly domicilioService = inject(DomicilioService);
  private readonly router = inject(Router);

  currentStep = 1;

  // Formularios para cada paso
  datosBasicosForm!: FormGroup;
  datosAdicionalForm!: FormGroup;

  // Datos para los selects (cargados dinámicamente)
  departamentos: Departamento[] = [];
  ciudades: Ciudad[] = [];
  barrios: Barrio[] = [];
  tiposDocumento: TipoDocumento[] = [];

  // Loading states
  isLoadingDepartamentos = false;
  isLoadingCiudades = false;
  isLoadingBarrios = false;
  isLoadingTiposDoc = false;
  isSubmitting = false;

  // Terms and Conditions modal
  showTermsModal = signal(false);

  // Success/Error modals
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  modalMessage = signal('');

  // Password visibility
  showPassword = signal(false);

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  initializeForms() {
    this.datosBasicosForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      lastName: ['', [Validators.required, Validators.maxLength(255)]],
      mail: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      documento: ['', [Validators.required]],
      idTipoDoc: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      nacimiento: ['', [Validators.required]]
    });

    this.datosAdicionalForm = this.fb.group({
      idDepartamento: ['', Validators.required],
      idCiudad: ['', Validators.required],
      idBarrio: ['', Validators.required],
      calle: ['', [Validators.required, Validators.maxLength(255)]],
      numero: ['', [Validators.required]],
      piso: [''],
      depto: [''],
      observaciones: [''],
      aceptaTerminos: [false, Validators.requiredTrue]
    });
  }

  /**
   * Cargar datos iniciales desde el backend
   */
  loadInitialData(): void {
    this.loadDepartamentos();
    this.loadTiposDocumento();
  }

  /**
   * Cargar departamentos
   */
  loadDepartamentos(): void {
    this.isLoadingDepartamentos = true;
    this.domicilioService.getAllDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
        this.isLoadingDepartamentos = false;
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        this.isLoadingDepartamentos = false;
      }
    });
  }

  /**
   * Cargar ciudades cuando se selecciona un departamento
   */
  onDepartamentoChange(departamentoId: number): void {
    if (!departamentoId) {
      this.ciudades = [];
      this.barrios = [];
      this.datosAdicionalForm.patchValue({
        idCiudad: '',
        idBarrio: ''
      });
      return;
    }

    this.isLoadingCiudades = true;
    this.domicilioService.getCiudadesByDepartamento(departamentoId).subscribe({
      next: (data) => {
        this.ciudades = data;
        this.barrios = [];
        this.isLoadingCiudades = false;
        this.datosAdicionalForm.patchValue({
          idCiudad: '',
          idBarrio: ''
        });
      },
      error: (error) => {
        console.error('Error cargando ciudades:', error);
        this.isLoadingCiudades = false;
      }
    });
  }

  /**
   * Cargar barrios cuando se selecciona una ciudad
   */
  onCiudadChange(ciudadId: number): void {
    if (!ciudadId) {
      this.barrios = [];
      this.datosAdicionalForm.patchValue({
        idBarrio: ''
      });
      return;
    }

    this.isLoadingBarrios = true;
    this.domicilioService.getBarriosByCiudad(ciudadId).subscribe({
      next: (data) => {
        this.barrios = data;
        this.isLoadingBarrios = false;
        this.datosAdicionalForm.patchValue({
          idBarrio: ''
        });
      },
      error: (error) => {
        console.error('Error cargando barrios:', error);
        this.isLoadingBarrios = false;
      }
    });
  }

  /**
   * Cargar tipos de documento
   */
  loadTiposDocumento(): void {
    this.isLoadingTiposDoc = true;
    this.authService.getTiposDocumento().subscribe({
      next: (data) => {
        this.tiposDocumento = data;
        this.isLoadingTiposDoc = false;
      },
      error: (error) => {
        console.error('Error cargando tipos documento:', error);
        this.isLoadingTiposDoc = false;
      }
    });
  }

  nextStep() {
    if (this.currentStep === 1 && this.datosBasicosForm.valid) {
      this.currentStep = 2;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }



  onSubmit() {
    if (this.datosBasicosForm.valid && this.datosAdicionalForm.valid) {
      this.isSubmitting = true;

      // Construir el objeto UsuarioRequest según la estructura del backend
      const deptoValue = this.datosAdicionalForm.get('depto')?.value;
      const pisoValue = this.datosAdicionalForm.get('piso')?.value;
      const observacionesValue = this.datosAdicionalForm.get('observaciones')?.value;

      const usuarioRequest: any = {
        password: this.datosBasicosForm.get('password')?.value,
        name: this.datosBasicosForm.get('name')?.value,
        lastName: this.datosBasicosForm.get('lastName')?.value,
        mail: this.datosBasicosForm.get('mail')?.value,
        documento: this.datosBasicosForm.get('documento')?.value,
        telefono: this.datosBasicosForm.get('telefono')?.value,
        nacimiento: this.datosBasicosForm.get('nacimiento')?.value,
        idBarrio: parseInt(this.datosAdicionalForm.get('idBarrio')?.value),
        idTipoDoc: parseInt(this.datosBasicosForm.get('idTipoDoc')?.value),
        calle: this.datosAdicionalForm.get('calle')?.value,
        numero: this.datosAdicionalForm.get('numero')?.value
      };

      // Solo agregar campos opcionales si tienen valor
      if (deptoValue && deptoValue.trim()) {
        usuarioRequest.depto = deptoValue;
      }
      if (pisoValue && pisoValue.trim()) {
        usuarioRequest.piso = pisoValue;
      }
      if (observacionesValue && observacionesValue.trim()) {
        usuarioRequest.observaciones = observacionesValue;
      }

      console.log('Datos del usuario a enviar:', usuarioRequest);

      // Llamar al servicio de registro
      this.authService.registerUsuario(usuarioRequest).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.modalMessage.set('¡Registro exitoso! Por favor verifica tu correo electrónico para confirmar tu cuenta.');
          this.showSuccessModal.set(true);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          this.modalMessage.set('Error en el registro: ' + (error.error?.message || 'Por favor intenta nuevamente'));
          this.showErrorModal.set(true);
          this.isSubmitting = false;
        }
      });
    }
  }

  // Métodos auxiliares para validación
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Método para debug - verificar estado del formulario
  debugFormState() {
    console.log('Form valid:', this.datosBasicosForm.valid);
    console.log('Form errors:', this.datosBasicosForm.errors);
    console.log('Form values:', this.datosBasicosForm.value);
    Object.keys(this.datosBasicosForm.controls).forEach(key => {
      const control = this.datosBasicosForm.get(key);
      console.log(`${key}: valid=${control?.valid}, errors=`, control?.errors);
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  openTermsModal(): void {
    this.showTermsModal.set(true);
  }

  closeTermsModal(): void {
    this.showTermsModal.set(false);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/auth/login']);
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }
}