// Guardar en: src/app/features/profesionales/dashboard/dashboard-solicitudes.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SolicitudMapComponent } from '../../../domain/solicitudes/solicitud-map.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard-solicitudes',
  standalone: true,
  imports: [CommonModule, SolicitudMapComponent],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">
            <i class="bi bi-inbox-fill"></i>
            Solicitudes Recibidas
          </h2>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3">Cargando solicitudes...</p>
      </div>

      <!-- Sin solicitudes -->
      <div *ngIf="!loading && solicitudes.length === 0" class="text-center py-5">
        <i class="bi bi-inbox" style="font-size: 4rem; opacity: 0.3;"></i>
        <p class="text-muted mt-3">No tienes solicitudes pendientes</p>
      </div>

      <!-- Lista de solicitudes -->
      <div class="row" *ngIf="!loading && solicitudes.length > 0">
        <div class="col-12">
          <div class="solicitudes-cards">
            <div class="solicitud-card" *ngFor="let solicitud of solicitudes">
              <div class="card-header-custom">
                <div class="cliente-info">
                  <i class="bi bi-person-circle"></i>
                  <h5>{{ solicitud.nombreCliente }} {{ solicitud.apellidoCliente }}</h5>
                </div>
                <span class="badge" [class]="getBadgeClass(solicitud.estado)">
                  {{ solicitud.estado }}
                </span>
              </div>

              <div class="card-body-custom">
                <div class="info-item">
                  <i class="bi bi-calendar"></i>
                  <span><strong>Fecha:</strong> {{ formatDate(solicitud.fechaSolicitud) }}</span>
                </div>
                <div class="info-item">
                  <i class="bi bi-clock"></i>
                  <span><strong>Hora:</strong> {{ solicitud.horaReserva || 'No especificada' }}</span>
                </div>
                <div class="info-item">
                  <i class="bi bi-geo-alt"></i>
                  <span><strong>Dirección:</strong> {{ solicitud.direccionCompleta || 'No disponible' }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button class="btn btn-outline-primary btn-sm" (click)="verDetalle(solicitud)">
                  <i class="bi bi-eye"></i>
                  Ver Detalle con Mapa
                </button>
                <button 
                  *ngIf="solicitud.estado === 'PENDIENTE'"
                  class="btn btn-success btn-sm" 
                  (click)="aceptarSolicitud(solicitud.idSolicitud)">
                  <i class="bi bi-check-circle"></i>
                  Aceptar
                </button>
                <button 
                  *ngIf="solicitud.estado === 'PENDIENTE'"
                  class="btn btn-danger btn-sm" 
                  (click)="rechazarSolicitud(solicitud.idSolicitud)">
                  <i class="bi bi-x-circle"></i>
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalle CON MAPA -->
    <div class="modal fade" id="detalleModal" tabindex="-1" *ngIf="solicitudSeleccionada">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-file-text"></i>
              Detalle de Solicitud - {{ solicitudSeleccionada.nombreCliente }} {{ solicitudSeleccionada.apellidoCliente }}
            </h5>
            <button type="button" class="btn-close" (click)="cerrarModal()"></button>
          </div>
          
          <div class="modal-body">
            <div class="row">
              <!-- Columna izquierda: Información -->
              <div class="col-lg-5">
                <!-- Información del cliente -->
                <div class="card mb-3">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">
                      <i class="bi bi-person-fill"></i>
                      Información del Cliente
                    </h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Nombre:</strong><br>
                    {{ solicitudSeleccionada.nombreCliente }} {{ solicitudSeleccionada.apellidoCliente }}</p>
                    
                    <p *ngIf="solicitudSeleccionada.telefonoCliente">
                      <strong>Teléfono:</strong><br>
                      <a [href]="'tel:' + solicitudSeleccionada.telefonoCliente" class="text-decoration-none">
                        <i class="bi bi-telephone"></i> {{ solicitudSeleccionada.telefonoCliente }}
                      </a>
                    </p>
                    
                    <p *ngIf="solicitudSeleccionada.emailCliente">
                      <strong>Email:</strong><br>
                      <a [href]="'mailto:' + solicitudSeleccionada.emailCliente" class="text-decoration-none">
                        <i class="bi bi-envelope"></i> {{ solicitudSeleccionada.emailCliente }}
                      </a>
                    </p>
                  </div>
                </div>

                <!-- Detalles del servicio -->
                <div class="card mb-3">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">
                      <i class="bi bi-info-circle"></i>
                      Detalles del Servicio
                    </h6>
                  </div>
                  <div class="card-body">
                    <p><strong>Oficio:</strong> {{ solicitudSeleccionada.oficio }}</p>
                    <p><strong>Fecha solicitada:</strong> {{ formatDate(solicitudSeleccionada.fechaServicio) }}</p>
                    <p><strong>Hora:</strong> {{ solicitudSeleccionada.horaReserva || 'No especificada' }}</p>
                    <p *ngIf="solicitudSeleccionada.descripcion">
                      <strong>Descripción:</strong><br>
                      {{ solicitudSeleccionada.descripcion }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Columna derecha: MAPA -->
              <div class="col-lg-7">
                <div class="card h-100">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">
                      <i class="bi bi-geo-alt-fill"></i>
                      Ubicación del Cliente
                    </h6>
                  </div>
                  <div class="card-body p-0" style="min-height: 500px;">
                    <app-solicitud-map
                      [solicitud]="solicitudSeleccionada"
                      [mapId]="'modal-map-' + solicitudSeleccionada.idSolicitud">
                    </app-solicitud-map>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="cerrarModal()">
              <i class="bi bi-x"></i>
              Cerrar
            </button>
            
            <button 
              *ngIf="solicitudSeleccionada.estado === 'PENDIENTE'"
              type="button" 
              class="btn btn-danger"
              (click)="rechazarSolicitud(solicitudSeleccionada.idSolicitud)">
              <i class="bi bi-x-circle"></i>
              Rechazar
            </button>
            
            <button 
              *ngIf="solicitudSeleccionada.estado === 'PENDIENTE'"
              type="button" 
              class="btn btn-success"
              (click)="aceptarSolicitud(solicitudSeleccionada.idSolicitud)">
              <i class="bi bi-check-circle"></i>
              Aceptar Solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .solicitudes-cards {
      display: grid;
      gap: 1.5rem;
    }

    .solicitud-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }
    }

    .card-header-custom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      .cliente-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        i {
          font-size: 2rem;
        }

        h5 {
          margin: 0;
          font-weight: 600;
        }
      }
    }

    .card-body-custom {
      padding: 1.25rem;
      background: #f8f9fa;

      .info-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: 8px;

        i {
          font-size: 1.25rem;
          color: #667eea;
          min-width: 24px;
        }

        span {
          font-size: 0.95rem;
        }
      }
    }

    .card-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1.25rem;
      background: white;
      border-top: 1px solid #e9ecef;
      flex-wrap: wrap;

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.2s;

        i {
          font-size: 1.1rem;
        }

        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    .badge {
      padding: 0.5em 1em;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 20px;
    }

    .badge.bg-warning {
      background: #ffc107 !important;
      color: #000;
    }

    .badge.bg-success {
      background: #28a745 !important;
    }

    .badge.bg-danger {
      background: #dc3545 !important;
    }

    .modal-xl {
      max-width: 1200px;
    }

    .card-header {
      h6 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    @media (max-width: 991px) {
      .modal-xl {
        max-width: 90%;
      }

      .card-actions {
        flex-direction: column;

        .btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `]
})
export class DashboardSolicitudesComponent implements OnInit {
  solicitudes: any[] = [];
  solicitudSeleccionada: any = null;
  loading: boolean = true;
  idProfesional: number = 0;
  private modalInstance: any;

  constructor(private http: HttpClient) {}

  async ngOnInit(): Promise<void> {
    // TODO: Obtener ID del profesional del servicio de autenticación
    // this.idProfesional = this.authService.currentUser().idProfesional;
    
    await this.cargarSolicitudes();
  }

  async cargarSolicitudes(): Promise<void> {
    this.loading = true;

    try {
      const url = `${environment.apiUrl}/api/v1/solicitudes/profesional/${this.idProfesional}/con-ubicacion`;
      const result = await this.http.get<any[]>(url).toPromise();
      this.solicitudes = result || [];
      
      console.log('✅ Solicitudes cargadas:', this.solicitudes);
    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error);
      this.solicitudes = [];
    } finally {
      this.loading = false;
    }
  }

  verDetalle(solicitud: any): void {
    console.log('👁️ Abriendo detalle de solicitud:', solicitud);
    this.solicitudSeleccionada = solicitud;
    
    // Esperar un tick para que el DOM se actualice
    setTimeout(() => {
      const modalElement = document.getElementById('detalleModal');
      if (modalElement) {
        if (typeof (window as any).bootstrap !== 'undefined') {
          this.modalInstance = new (window as any).bootstrap.Modal(modalElement);
          this.modalInstance.show();
        } else {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          document.body.classList.add('modal-open');
          
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          backdrop.id = 'modalBackdrop';
          document.body.appendChild(backdrop);
        }
        
        console.log('✅ Modal abierto, mapa debería inicializarse');
      } else {
        console.error('❌ No se encontró el elemento del modal');
      }
    }, 50);
  }

  async aceptarSolicitud(idSolicitud: number): Promise<void> {
    if (!confirm('¿Estás seguro de que deseas aceptar esta solicitud?')) {
      return;
    }

    try {
      await this.http.put(
        `${environment.apiUrl}/api/v1/solicitudes/responder/${idSolicitud}?aceptada=true`,
        {}
      ).toPromise();

      alert('✅ Solicitud aceptada correctamente');
      this.cerrarModal();
      await this.cargarSolicitudes();
    } catch (error) {
      console.error('❌ Error al aceptar solicitud:', error);
      alert('Error al aceptar la solicitud');
    }
  }

  async rechazarSolicitud(idSolicitud: number): Promise<void> {
    if (!confirm('¿Estás seguro de que deseas rechazar esta solicitud?')) {
      return;
    }

    try {
      await this.http.put(
        `${environment.apiUrl}/api/v1/solicitudes/responder/${idSolicitud}?aceptada=false`,
        {}
      ).toPromise();

      alert('✅ Solicitud rechazada');
      this.cerrarModal();
      await this.cargarSolicitudes();
    } catch (error) {
      console.error('❌ Error al rechazar solicitud:', error);
      alert('Error al rechazar la solicitud');
    }
  }

  cerrarModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    } else {
      const modalElement = document.getElementById('detalleModal');
      if (modalElement) {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    }
    
    // Limpiar selección después de cerrar
    setTimeout(() => {
      this.solicitudSeleccionada = null;
    }, 300);
  }

  formatDate(date: string): string {
    if (!date) return 'No especificada';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning';
      case 'ACEPTADA': return 'bg-success';
      case 'RECHAZADA': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}