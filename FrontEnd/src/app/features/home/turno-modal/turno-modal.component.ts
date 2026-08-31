import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-angular';
import { SolicitudHttpRepository } from '../../../data/solicitudes/solicitud.http.repository';
import { TurnoDisponible, ConfirmarTurnoRequest } from '../../../domain/solicitudes/solicitud.model';
import { PerfilProfesional } from '../../../domain/profesionales/models/perfil-profesional.model';

@Component({
  selector: 'app-turno-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './turno-modal.component.html',
  styleUrl: './turno-modal.component.scss'
})
export class TurnoModalComponent implements OnInit {
  @Input() professional!: PerfilProfesional;
  @Input() idUsuario!: number;
  @Output() close = new EventEmitter<void>();
  @Output() turnoConfirmado = new EventEmitter<any>();

  private readonly solicitudRepo = inject(SolicitudHttpRepository);

  // Icons
  readonly X = X;
  readonly Calendar = Calendar;
  readonly Clock = Clock;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;

  // State
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  turnosDisponibles = signal<TurnoDisponible[]>([]);
  paso = signal<'seleccion-turno' | 'observacion'>('seleccion-turno'); // Controla el paso actual

  // Form
  fechaInicio = signal<string>('');
  duracion = signal(60);
  turnoSeleccionado = signal<TurnoDisponible | null>(null);
  observacion = signal('');

  ngOnInit(): void {
    // Establecer fecha inicio como hoy
    const hoy = new Date();
    this.fechaInicio.set(this.formatDate(hoy));
    this.cargarTurnos();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cargarTurnos(): void {
    if (!this.fechaInicio()) return;

    this.loading.set(true);
    this.error.set(null);
    this.turnoSeleccionado.set(null);

    this.solicitudRepo.obtenerTurnosDisponiblesSemana(
      this.professional.idProfesional,
      this.fechaInicio(),
      this.duracion()
    ).subscribe({
      next: (turnos) => {
        this.turnosDisponibles.set(turnos);
        this.loading.set(false);
        if (turnos.length === 0) {
          this.error.set('No hay turnos disponibles en esta semana');
        }
      },
      error: (err) => {
        console.error('Error al cargar turnos:', err);
        this.error.set('Error al cargar los turnos disponibles');
        this.loading.set(false);
        this.turnosDisponibles.set([]);
      }
    });
  }

  seleccionarTurno(turno: TurnoDisponible): void {
    this.turnoSeleccionado.set(turno);
    this.error.set(null);
  }

  continuarAObservacion(): void {
    if (!this.turnoSeleccionado()) {
      this.error.set('Por favor seleccione un turno');
      return;
    }
    this.paso.set('observacion');
    this.error.set(null);
  }

  volverASeleccionTurno(): void {
    this.paso.set('seleccion-turno');
    this.error.set(null);
  }

  confirmarTurno(): void {
    const turno = this.turnoSeleccionado();
    const obs = this.observacion().trim();

    if (!turno) {
      this.error.set('Por favor seleccione un turno');
      return;
    }

    if (!obs) {
      this.error.set('Por favor ingrese una observación sobre el trabajo');
      return;
    }

    const request: ConfirmarTurnoRequest = {
      idUsuario: this.idUsuario,
      idProfesional: this.professional.idProfesional,
      fecha: turno.fecha,
      hora: turno.horaInicio,
      duracion: this.duracion(),
      observacion: obs
    };

    this.loading.set(true);
    this.error.set(null);

    this.solicitudRepo.confirmarTurno(request).subscribe({
      next: (response) => {
        console.log('Turno confirmado:', response);
        this.success.set(true);
        this.loading.set(false);

        // Esperar 2 segundos y cerrar
        setTimeout(() => {
          this.turnoConfirmado.emit(response);
          this.close.emit();
        }, 2000);
      },
      error: (err) => {
        console.error('Error al confirmar turno:', err);
        this.error.set(err.error?.message || 'Error al confirmar el turno. Por favor intente nuevamente.');
        this.loading.set(false);
      }
    });
  }

  cambiarSemana(direccion: 'anterior' | 'siguiente'): void {
    const fechaActual = new Date(this.fechaInicio());
    const dias = direccion === 'siguiente' ? 7 : -7;
    fechaActual.setDate(fechaActual.getDate() + dias);
    this.fechaInicio.set(this.formatDate(fechaActual));
    this.cargarTurnos();
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha + 'T00:00:00');
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es-AR', opciones);
  }

  formatearHora(hora: string): string {
    // Formato HH:mm:ss a HH:mm
    return hora.substring(0, 5);
  }

  agruparTurnosPorFecha(): { fecha: string; turnos: TurnoDisponible[] }[] {
    const turnos = this.turnosDisponibles();
    const grupos = new Map<string, TurnoDisponible[]>();

    turnos.forEach(turno => {
      if (!grupos.has(turno.fecha)) {
        grupos.set(turno.fecha, []);
      }
      grupos.get(turno.fecha)!.push(turno);
    });

    return Array.from(grupos.entries()).map(([fecha, turnos]) => ({
      fecha,
      turnos: turnos.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    }));
  }

  cerrarModal(): void {
    if (!this.loading()) {
      this.close.emit();
    }
  }
}
