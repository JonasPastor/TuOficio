import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, PlayCircle, PauseCircle, CheckCircle, XCircle, DollarSign } from 'lucide-angular';
import { TrabajoService } from '../../domain/trabajo/trabajo.service';
import { PagoService } from '../../domain/pago/pago.service';
import { TrabajoResponse } from '../../domain/trabajo/trabajo.model';
import { FacturaRequest } from '../../domain/pago/pago.model';

@Component({
  selector: 'app-trabajo-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './trabajo-detalle.component.html',
  styleUrls: ['./trabajo-detalle.component.scss']
})
export class TrabajoDetalleComponent implements OnInit {
  private readonly trabajoService = inject(TrabajoService);
  private readonly pagoService = inject(PagoService);
  private readonly router = inject(Router);

  // Icons
  readonly PlayCircle = PlayCircle;
  readonly PauseCircle = PauseCircle;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly DollarSign = DollarSign;

  // State
  trabajo = signal<TrabajoResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Form para finalizar trabajo
  descripcionFinalizacion = signal('');
  costoFinal = signal<number>(0);

  // Modal
  mostrarModalFinalizacion = signal(false);
  mostrarModalPago = signal(false);

  ngOnInit(): void {
    // Aquí deberías obtener el ID del trabajo desde la ruta o desde el estado
    // Por ahora lo dejo como ejemplo
    // this.cargarTrabajo(idTrabajo);
  }

  cargarTrabajo(idTrabajo: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.trabajoService.obtenerTrabajo(idTrabajo).subscribe({
      next: (trabajo) => {
        this.trabajo.set(trabajo);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar trabajo:', err);
        this.error.set('Error al cargar el trabajo');
        this.loading.set(false);
      }
    });
  }

  iniciarTrabajo(): void {
    const trabajo = this.trabajo();
    if (!trabajo) return;

    this.loading.set(true);
    this.trabajoService.iniciarTrabajo(trabajo.idTrabajo).subscribe({
      next: (trabajoActualizado) => {
        this.trabajo.set(trabajoActualizado);
        this.loading.set(false);
        alert('Trabajo iniciado correctamente');
      },
      error: (err) => {
        console.error('Error al iniciar trabajo:', err);
        this.error.set('Error al iniciar el trabajo');
        this.loading.set(false);
      }
    });
  }

  pausarTrabajo(): void {
    const trabajo = this.trabajo();
    if (!trabajo) return;

    this.loading.set(true);
    this.trabajoService.pausarTrabajo(trabajo.idTrabajo).subscribe({
      next: (trabajoActualizado) => {
        this.trabajo.set(trabajoActualizado);
        this.loading.set(false);
        alert('Trabajo pausado');
      },
      error: (err) => {
        console.error('Error al pausar trabajo:', err);
        this.error.set('Error al pausar el trabajo');
        this.loading.set(false);
      }
    });
  }

  reanudarTrabajo(): void {
    const trabajo = this.trabajo();
    if (!trabajo) return;

    this.loading.set(true);
    this.trabajoService.reanudarTrabajo(trabajo.idTrabajo).subscribe({
      next: (trabajoActualizado) => {
        this.trabajo.set(trabajoActualizado);
        this.loading.set(false);
        alert('Trabajo reanudado');
      },
      error: (err) => {
        console.error('Error al reanudar trabajo:', err);
        this.error.set('Error al reanudar el trabajo');
        this.loading.set(false);
      }
    });
  }

  abrirModalFinalizacion(): void {
    this.mostrarModalFinalizacion.set(true);
  }

  cerrarModalFinalizacion(): void {
    this.mostrarModalFinalizacion.set(false);
    this.descripcionFinalizacion.set('');
    this.costoFinal.set(0);
  }

  finalizarTrabajo(): void {
    const trabajo = this.trabajo();
    if (!trabajo) return;

    const descripcion = this.descripcionFinalizacion();
    const costo = this.costoFinal();

    if (!descripcion || costo <= 0) {
      alert('Por favor complete todos los campos');
      return;
    }

    this.loading.set(true);
    this.trabajoService.finalizarTrabajo(trabajo.idTrabajo, descripcion, costo).subscribe({
      next: (trabajoActualizado) => {
        this.trabajo.set(trabajoActualizado);
        this.loading.set(false);
        this.cerrarModalFinalizacion();
        // Mostrar modal de pago
        this.mostrarModalPago.set(true);
      },
      error: (err) => {
        console.error('Error al finalizar trabajo:', err);
        this.error.set('Error al finalizar el trabajo');
        this.loading.set(false);
      }
    });
  }

  procesarPago(): void {
    const trabajo = this.trabajo();
    if (!trabajo || !trabajo.montoFinal) return;

    const request: FacturaRequest = {
      idSolicitud: trabajo.idSolicitud,
      idTrabajo: trabajo.idTrabajo,
      titulo: `Pago por ${trabajo.oficio || 'servicio'}`,
      descripcion: trabajo.observacionesTrabajo || 'Servicio profesional completado',
      cantidad: 1,
      monto: trabajo.montoFinal
    };

    this.loading.set(true);

    // Opción 1: Crear preferencia y redirigir automáticamente
    this.pagoService.crearPreferenciaYRedirigir(request).subscribe({
      next: (response) => {
        console.log('Preferencia creada:', response);
        // La redirección se hace automáticamente en el servicio
      },
      error: (err) => {
        console.error('Error al crear preferencia de pago:', err);
        this.error.set('Error al procesar el pago. Por favor intente nuevamente.');
        this.loading.set(false);
      }
    });

    // Opción 2: Crear preferencia y redirigir manualmente
    /*
    this.pagoService.crearPreferencia(request).subscribe({
      next: (response) => {
        console.log('Preferencia creada:', response);
        this.loading.set(false);
        // Redirigir a Mercado Pago
        this.pagoService.redirigirAPago(response.initPoint);
      },
      error: (err) => {
        console.error('Error al crear preferencia de pago:', err);
        this.error.set('Error al procesar el pago');
        this.loading.set(false);
      }
    });
    */
  }

  cerrarModalPago(): void {
    this.mostrarModalPago.set(false);
  }

  cancelarTrabajo(): void {
    const trabajo = this.trabajo();
    if (!trabajo) return;

    const motivo = prompt('Ingrese el motivo de cancelación:');
    if (!motivo) return;

    this.loading.set(true);
    this.trabajoService.cancelarTrabajo(trabajo.idTrabajo, motivo).subscribe({
      next: (trabajoActualizado) => {
        this.trabajo.set(trabajoActualizado);
        this.loading.set(false);
        alert('Trabajo cancelado');
      },
      error: (err) => {
        console.error('Error al cancelar trabajo:', err);
        this.error.set('Error al cancelar el trabajo');
        this.loading.set(false);
      }
    });
  }
}
