import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, Star, Phone, DollarSign, Calendar, Clock, MapPin, Award, Image, Mail, Upload, X, Plus, Flag, CheckCircle } from 'lucide-angular';
import { GetPerfilProfesionalUseCase } from '../../../domain/profesionales/use-cases/get-perfil-profesional.usecase';
import { PerfilProfesional, FotoGaleria } from '../../../domain/profesionales/models/perfil-profesional.model';
import { AuthService } from '../../../domain/auth/auth.service';
import { FotoGaleriaService } from '../../../domain/galeria/foto-galeria.service';
import { FirebaseStorageService } from '../../../core/services/firebase-storage.service';
import { NotificacionService } from '../../../data/notificaciones/notificacion.service';
import { ReporteProfesional } from '../../../domain/notificaciones/notificacion.model';

@Component({
  selector: 'app-perfil-profesional',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './perfil-profesional.component.html',
  styleUrl: './perfil-profesional.component.scss'
})
export class PerfilProfesionalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly getPerfilUseCase = inject(GetPerfilProfesionalUseCase);
  private readonly authService = inject(AuthService);
  private readonly fotoGaleriaService = inject(FotoGaleriaService);
  private readonly firebaseStorage = inject(FirebaseStorageService);
  private readonly notificacionService = inject(NotificacionService);

  // Icons
  readonly ArrowLeft = ArrowLeft;
  readonly Star = Star;
  readonly Phone = Phone;
  readonly DollarSign = DollarSign;
  readonly Calendar = Calendar;
  readonly Clock = Clock;
  readonly MapPin = MapPin;
  readonly Award = Award;
  readonly Image = Image;
  readonly Mail = Mail;
  readonly Upload = Upload;
  readonly X = X;
  readonly Plus = Plus;
  readonly Flag = Flag;
  readonly CheckCircle = CheckCircle;

  profesional: PerfilProfesional | null = null;
  loading = true;
  error: string | null = null;
  
  // Gallery upload
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  nuevaFotoDescripcion = '';
  uploadingFoto = false;
  uploadError: string | null = null;
  showUploadModal = false;

  // Report modal
  showReportModal = false;
  reportReason = '';
  sendingReport = false;
  reportError: string | null = null;
  showSuccessModal = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProfessional(parseInt(id));
    } else {
      this.error = 'ID de profesional no válido';
      this.loading = false;
    }
  }

  private loadProfessional(id: number): void {
    this.getPerfilUseCase.execute(id).subscribe({
      next: (perfil: PerfilProfesional) => {
        this.profesional = perfil;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar el perfil:', err);
        this.error = 'No se pudo cargar el perfil del profesional';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  get professionalName(): string {
    return this.profesional 
      ? `${this.profesional.nombre} ${this.profesional.apellido}`
      : '';
  }

  get hasAvailability(): boolean {
    return !!this.profesional?.disponibilidad && this.profesional.disponibilidad.length > 0;
  }

  get sortedDisponibilidad() {
    if (!this.hasAvailability || !this.profesional?.disponibilidad) return [];

    const diasOrden = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

    return [...this.profesional.disponibilidad].sort((a, b) => {
      const indexA = diasOrden.indexOf(a.diaSemana.toUpperCase());
      const indexB = diasOrden.indexOf(b.diaSemana.toUpperCase());
      return indexA - indexB;
    });
  }

  formatDayName(dia: string): string {
    const dias: { [key: string]: string } = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes',
      'MIÉRCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SÁBADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return dias[dia.toUpperCase()] || dia;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  get hasSpecialties(): boolean {
    return !!this.profesional?.especialidades && this.profesional.especialidades.length > 0;
  }
  
  get isOwnProfile(): boolean {
    const currentUser = this.authService.currentUser();
    return !!currentUser && !!currentUser.idProfesional && 
           currentUser.idProfesional === this.profesional?.idProfesional;
  }
  
  get fotosGaleria(): FotoGaleria[] {
    return this.profesional?.fotosGaleria || [];
  }
  
  openUploadModal(): void {
    this.showUploadModal = true;
    this.selectedFile = null;
    this.previewUrl = null;
    this.nuevaFotoDescripcion = '';
    this.uploadError = null;
  }
  
  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.previewUrl = null;
    this.nuevaFotoDescripcion = '';
    this.uploadError = null;
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    
    // Validar el archivo
    const validation = this.firebaseStorage.validateImageFile(file);
    if (!validation.valid) {
      this.uploadError = validation.error || 'Archivo no válido';
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }
    
    // Guardar el archivo y crear preview
    this.selectedFile = file;
    this.uploadError = null;
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
  
  agregarFoto(): void {
    if (!this.selectedFile || !this.profesional) return;
    
    this.uploadingFoto = true;
    this.uploadError = null;
    
    // Subir la imagen a Firebase Storage
    const path = `galeria/profesional_${this.profesional.idProfesional}/${Date.now()}_${this.selectedFile.name}`;
    
    this.firebaseStorage.uploadImage(this.selectedFile, path).subscribe({
      next: (downloadUrl) => {
        // Una vez obtenida la URL, guardarla en la base de datos
        const nuevaFoto: FotoGaleria = {
          urlFoto: downloadUrl,
          descripcion: this.nuevaFotoDescripcion.trim() || undefined,
          orden: this.fotosGaleria.length
        };
        
        this.fotoGaleriaService.agregarFoto(this.profesional!.idProfesional, nuevaFoto).subscribe({
          next: (foto) => {
            if (this.profesional) {
              if (!this.profesional.fotosGaleria) {
                this.profesional.fotosGaleria = [];
              }
              this.profesional.fotosGaleria.push(foto);
            }
            this.uploadingFoto = false;
            this.closeUploadModal();
          },
          error: (err) => {
            console.error('Error al guardar foto en BD:', err);
            this.uploadError = 'Error al guardar la foto. Por favor, intenta nuevamente.';
            this.uploadingFoto = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al subir imagen a Firebase:', err);
        this.uploadError = 'Error al subir la imagen. Por favor, intenta nuevamente.';
        this.uploadingFoto = false;
      }
    });
  }
  
  eliminarFoto(foto: FotoGaleria): void {
    if (!this.profesional || !foto.id) return;
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta foto?')) return;
    
    this.fotoGaleriaService.eliminarFoto(this.profesional.idProfesional, foto.id).subscribe({
      next: () => {
        if (this.profesional?.fotosGaleria) {
          this.profesional.fotosGaleria = this.profesional.fotosGaleria.filter(f => f.id !== foto.id);
        }
      },
      error: (err) => {
        console.error('Error al eliminar foto:', err);
        alert('Error al eliminar la foto. Por favor, intenta nuevamente.');
      }
    });
  }

  // Report methods
  openReportModal(): void {
    this.showReportModal = true;
    this.reportReason = '';
    this.reportError = null;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportReason = '';
    this.reportError = null;
    this.sendingReport = false;
  }

  enviarReporte(): void {
    if (!this.profesional || !this.reportReason.trim()) {
      this.reportError = 'Por favor, ingresa una razón para el reporte';
      return;
    }

    if (this.reportReason.trim().length < 10) {
      this.reportError = 'La razón debe tener al menos 10 caracteres';
      return;
    }

    this.sendingReport = true;
    this.reportError = null;

    const currentUser = this.authService.currentUser();
    const reporte: ReporteProfesional = {
      idProfesional: this.profesional.idProfesional,
      nombreProfesional: this.professionalName,
      razon: this.reportReason.trim(),
      reportadoPor: currentUser?.id || undefined
    };

    this.notificacionService.reportarProfesional(reporte).subscribe({
      next: (response) => {
        console.log('✅ Reporte enviado correctamente:', response);
        this.closeReportModal();
        this.showSuccessModal = true;
        setTimeout(() => this.showSuccessModal = false, 3000);
      },
      error: (err) => {
        console.error('❌ Error al enviar reporte:', err);
        this.reportError = 'Error al enviar el reporte. Por favor, intenta nuevamente.';
        this.sendingReport = false;
      }
    });
  }
}
