import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PerfilService } from '../../../domain/usuario/use-cases/perfil.service';
import { PerfilUsuario, PerfilUsuarioRequest } from '../../../domain/usuario/models/perfil.model';
import { AuthService } from '../../../domain/auth/auth.service';
import { FirebaseStorageService } from '../../../core/services/firebase-storage.service';
import { DomicilioService } from '../../../domain/domicilio/domicilio.service';
import { Departamento, Ciudad, Barrio } from '../../../domain/domicilio/domicilio.model';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, ArrowLeft, Edit, X, Camera } from 'lucide-angular';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly firebaseStorage = inject(FirebaseStorageService);
  private readonly domicilioService = inject(DomicilioService);

  // Lucide icons
  readonly ArrowLeft = ArrowLeft;
  readonly Edit = Edit;
  readonly X = X;
  readonly Camera = Camera;

  perfilForm: FormGroup;
  isEditing = false;
  isLoading = false;
  isUploadingImage = false;
  error: string | null = null;
  success: string | null = null;
  imagePreview: string | null = null;
  direccionId: number | null = null; // ID de la dirección en la BD
  
  // Datos para desplegables
  departamentos: Departamento[] = [];
  ciudades: Ciudad[] = [];
  barrios: Barrio[] = [];
  isLoadingDepartamentos = false;
  isLoadingCiudades = false;
  isLoadingBarrios = false;

  constructor() {
    this.perfilForm = this.createForm();
  }

  ngOnInit() {
    this.cargarPerfil();
    this.cargarDepartamentos();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      avatar: [''], // Campo para la foto de usuario
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }], // Email no editable
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      documento: ['', [Validators.required, Validators.minLength(7)]],
      tipoDocumento: ['', Validators.required],
      nacimiento: ['', Validators.required],
      domicilio: this.formBuilder.group({
        calle: ['', Validators.required],
        numero: ['', Validators.required],
        piso: [''],
        depto: [''],
        idBarrio: ['', Validators.required],
        idCiudad: ['', Validators.required],
        idDepartamento: ['', Validators.required]
      })
    });
  }

  cargarPerfil() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Usuario no autenticado';
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.perfilService.obtenerPerfil(currentUser.id.toString()).subscribe({
      next: (perfil: PerfilUsuario) => {
        this.perfilForm.patchValue(perfil);
        this.imagePreview = perfil.avatar || null;
        this.direccionId = perfil.domicilio.id || null; // Guardar ID de dirección
        
        // Cargar datos de ubicación en cascada
        this.cargarUbicacionDelPerfil(perfil.domicilio);
        
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el perfil. Intente nuevamente.';
        this.isLoading = false;
        console.error('Error cargando perfil:', error);
      }
    });
  }

  private cargarUbicacionDelPerfil(domicilio: any): void {
    // Primero cargar todos los departamentos
    this.domicilioService.getAllDepartamentos().subscribe({
      next: (departamentos: Departamento[]) => {
        this.departamentos = departamentos;
        
        // Buscar el departamento que coincida con el nombre
        const departamentoEncontrado = departamentos.find(
          d => d.departamento.toLowerCase() === domicilio.departamento.toLowerCase()
        );
        
        if (departamentoEncontrado) {
          // Cargar ciudades de ese departamento
          this.domicilioService.getCiudadesByDepartamento(departamentoEncontrado.id).subscribe({
            next: (ciudades: Ciudad[]) => {
              this.ciudades = ciudades;
              
              // Buscar la ciudad que coincida
              const ciudadEncontrada = ciudades.find(
                c => c.ciudad.toLowerCase() === domicilio.ciudad.toLowerCase()
              );
              
              if (ciudadEncontrada) {
                // Cargar barrios de esa ciudad
                this.domicilioService.getBarriosByCiudad(ciudadEncontrada.id).subscribe({
                  next: (barrios: Barrio[]) => {
                    this.barrios = barrios;
                    
                    // Buscar el barrio que coincida
                    const barrioEncontrado = barrios.find(
                      b => b.barrio.toLowerCase() === domicilio.barrio.toLowerCase()
                    );
                    
                    // Actualizar el formulario con los IDs correctos
                    this.perfilForm.get('domicilio')?.patchValue({
                      idDepartamento: departamentoEncontrado.id,
                      idCiudad: ciudadEncontrada.id,
                      idBarrio: barrioEncontrado?.id || ''
                    });
                  },
                  error: (error: any) => console.error('Error cargando barrios:', error)
                });
              }
            },
            error: (error: any) => console.error('Error cargando ciudades:', error)
          });
        }
      },
      error: (error: any) => console.error('Error cargando departamentos:', error)
    });
  }

  toggleEditar() {
    this.isEditing = !this.isEditing;
    this.error = null;
    this.success = null;

    if (!this.isEditing) {
      // Cancelar edición - recargar datos originales
      this.cargarPerfil();
    }
  }

  guardarCambios() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Usuario no autenticado';
      return;
    }

    if (this.perfilForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      const formValue = this.perfilForm.getRawValue();
      const domicilioFormValue = formValue.domicilio;
      const barrioSeleccionado = this.barrios.find(b => b.id === domicilioFormValue.idBarrio);
      
      // Crear el objeto en el formato que espera el backend
      const updateRequest = {
        mail: formValue.email,
        name: formValue.name,
        lastName: formValue.lastName,
        phone: formValue.telefono,
        adress: this.direccionId ? {
          id: this.direccionId,
          idbarrio: barrioSeleccionado ? { id: barrioSeleccionado.id } : null,
          calle: domicilioFormValue.calle,
          numero: domicilioFormValue.numero,
          piso: domicilioFormValue.piso || null,
          depto: domicilioFormValue.depto || null
        } : null
      };

      this.perfilService.actualizarPerfil(currentUser.id.toString(), updateRequest as any).subscribe({
        next: () => {
          this.success = 'Perfil actualizado correctamente';
          this.isEditing = false;
          this.isLoading = false;
          // Recargar el perfil para obtener los datos actualizados
          this.cargarPerfil();
        },
        error: (error) => {
          this.error = 'Error al actualizar el perfil. Intente nuevamente.';
          this.isLoading = false;
          console.error('Error actualizando perfil:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.perfilForm.controls).forEach(key => {
      const control = this.perfilForm.get(key);
      if (control) {
        control.markAsTouched();

        // Si es un FormGroup anidado (como domicilio)
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(nestedKey => {
            control.get(nestedKey)?.markAsTouched();
          });
        }
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.perfilForm.get(fieldName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return `${this.getFieldDisplayName(fieldName)} es requerido`;
      if (control.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['pattern']) return `${this.getFieldDisplayName(fieldName)} no tiene un formato válido`;
    }
    return null;
  }

  getDomicilioFieldError(fieldName: string): string | null {
    const control = this.perfilForm.get(`domicilio.${fieldName}`);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return `${this.getFieldDisplayName(fieldName)} es requerido`;
    }
    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'Nombre',
      lastName: 'Apellido',
      telefono: 'Teléfono',
      documento: 'Documento',
      tipoDocumento: 'Tipo de Documento',
      nacimiento: 'Fecha de Nacimiento',
      calle: 'Calle',
      numero: 'Número',
      barrio: 'Barrio',
      ciudad: 'Ciudad',
      departamento: 'Departamento'
    };
    return fieldNames[fieldName] || fieldName;
  }

  cambiarFoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.subirImagenAFirebase(file);
      }
    };
    input.click();
  }

  private subirImagenAFirebase(file: File) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Usuario no autenticado';
      return;
    }

    // Validar archivo
    const validation = this.firebaseStorage.validateImageFile(file);
    if (!validation.valid) {
      this.error = validation.error || 'Archivo no válido';
      return;
    }

    // Mostrar preview mientras se sube
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);

    // Subir a Firebase
    this.isUploadingImage = true;
    this.error = null;

    this.firebaseStorage.uploadAvatar(file, currentUser.id.toString())
      .pipe(
        finalize(() => {
          this.isUploadingImage = false;
        })
      )
      .subscribe({
        next: (downloadURL) => {
          console.log('✅ Imagen subida a Firebase:', downloadURL);
          // Actualizar el formulario con la URL de Firebase
          this.perfilForm.patchValue({
            avatar: downloadURL
          });
          this.imagePreview = downloadURL;
          
          // Guardar el avatar en el backend
          this.guardarAvatarEnBackend(downloadURL);
        },
        error: (error) => {
          console.error('❌ Error al subir imagen:', error);
          this.error = 'Error al subir la imagen. Intente nuevamente.';
          this.imagePreview = this.perfilForm.get('avatar')?.value || null;
        }
      });
  }

  private guardarAvatarEnBackend(avatarUrl: string) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Usuario no autenticado';
      return;
    }

    this.perfilService.actualizarAvatar(currentUser.id, avatarUrl).subscribe({
      next: () => {
        console.log('✅ Avatar guardado en el backend');
        // Actualizar el avatar en la sesión actual
        this.authService.updateUserAvatar(avatarUrl);
        this.success = 'Foto actualizada correctamente';
        setTimeout(() => {
          this.success = null;
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Error al guardar avatar en backend:', error);
        this.error = 'La imagen se subió pero hubo un error al guardarla. Por favor, recarga la página.';
      }
    });
  }

  private procesarImagen(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Actualizar el formulario con la nueva imagen
      this.perfilForm.patchValue({
        avatar: e.target.result
      });
    };
    reader.readAsDataURL(file);
  }

  onImageError(event: any) {
    // Si la imagen falla al cargar, usar un placeholder
    event.target.src = 'assets/icons/user-placeholder.svg';
  }

  volver() {
    this.router.navigate(['/home']);
  }

  // ===== Métodos para desplegables =====
  cargarDepartamentos(): void {
    this.isLoadingDepartamentos = true;
    this.domicilioService.getAllDepartamentos().subscribe({
      next: (data: Departamento[]) => {
        this.departamentos = data;
        this.isLoadingDepartamentos = false;
      },
      error: (error: any) => {
        console.error('Error cargando departamentos:', error);
        this.isLoadingDepartamentos = false;
      }
    });
  }

  onDepartamentoChange(departamentoId: string): void {
    if (!departamentoId) {
      this.ciudades = [];
      this.barrios = [];
      this.perfilForm.get('domicilio')?.patchValue({
        idCiudad: '',
        idBarrio: ''
      });
      return;
    }

    this.isLoadingCiudades = true;
    this.domicilioService.getCiudadesByDepartamento(Number(departamentoId)).subscribe({
      next: (data: Ciudad[]) => {
        this.ciudades = data;
        this.barrios = [];
        this.isLoadingCiudades = false;
        // Limpiar ciudad y barrio
        this.perfilForm.get('domicilio')?.patchValue({
          idCiudad: '',
          idBarrio: ''
        });
      },
      error: (error: any) => {
        console.error('Error cargando ciudades:', error);
        this.isLoadingCiudades = false;
      }
    });
  }

  onCiudadChange(ciudadId: string): void {
    if (!ciudadId) {
      this.barrios = [];
      this.perfilForm.get('domicilio')?.patchValue({
        idBarrio: ''
      });
      return;
    }

    this.isLoadingBarrios = true;
    this.domicilioService.getBarriosByCiudad(Number(ciudadId)).subscribe({
      next: (data: Barrio[]) => {
        this.barrios = data;
        this.isLoadingBarrios = false;
        // Limpiar barrio
        this.perfilForm.get('domicilio')?.patchValue({
          idBarrio: ''
        });
      },
      error: (error: any) => {
        console.error('Error cargando barrios:', error);
        this.isLoadingBarrios = false;
      }
    });
  }
}
