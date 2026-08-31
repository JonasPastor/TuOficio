import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SolicitudMapComponent } from './solicitud-map.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-solicitudes-profesional',
  standalone: true,
  imports: [CommonModule, SolicitudMapComponent],
  template: `
    <div class="solicitudes-container">
      <div class="header">
        <h2>
          <i class="bi bi-inbox"></i>
          Mis Solicitudes
        </h2>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando solicitudes...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle"></i>
        {{ error }}
      </div>

      <!-- Sin solicitudes -->
      <div *ngIf="!loading && solicitudes.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <h4>No tienes solicitudes</h4>
        <p>Cuando recibas solicitudes de clientes, aparecerán aquí</p>
      </div>

      <!-- Lista de solicitudes -->
      <div class="solicitudes-list" *ngIf="!loading && solicitudes.length > 0">
        <div class="solicitud-card" *ngFor="let solicitud of solicitudes">
          
          <!-- Header de la solicitud -->
          <div class="solicitud-header">
            <div class="solicitud-info">
              <span class="badge" [class]="'badge-' + solicitud.estado.toLowerCase()">
                {{ solicitud.estado }}
              </span>
              <h5>{{ solicitud.oficio }}</h5>
              <p class="fecha">
                <i class="bi bi-calendar"></i>
                {{ formatDate(solicitud.fechaSolicitud) }}
              </p>
            </div>
            
            <button 
              class="btn btn-link"
              (click)="toggleDetalles(solicitud.idSolicitud)">
              <i class="bi" [class.bi-chevron-down]="!solicitud.mostrarDetalles" 
                             [class.bi-chevron-up]="solicitud.mostrarDetalles"></i>
            </button>
          </div>

          <!-- Descripción -->
          <div class="solicitud-body" *ngIf="solicitud.descripcion">
            <h6>Descripción del trabajo:</h6>
            <p>{{ solicitud.descripcion }}</p>
          </div>

          <!-- Detalles expandibles -->
          <div class="solicitud-details" *ngIf="solicitud.mostrarDetalles">
            
            <!-- Mapa con ubicación -->
            <app-solicitud-map 
              [solicitud]="solicitud"
              [mapId]="'map-' + solicitud.idSolicitud">
            </app-solicitud-map>

            <!-- Acciones -->
            <div class="solicitud-actions">
              <button 
                class="btn btn-success"
                *ngIf="solicitud.estado === 'PENDIENTE'"
                (click)="aceptarSolicitud(solicitud.idSolicitud)">
                <i class="bi bi-check-circle"></i>
                Aceptar Solicitud
              </button>
              
              <button 
                class="btn btn-danger"
                *ngIf="solicitud.estado === 'PENDIENTE'"
                (click)="rechazarSolicitud(solicitud.idSolicitud)">
                <i class="bi bi-x-circle"></i>
                Rechazar
              </button>

              <button 
                class="btn btn-primary"
                *ngIf="solicitud.estado === 'ACEPTADA'"
                (click)="iniciarChat(solicitud)">
                <i class="bi bi-chat-dots"></i>
                Chatear con cliente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .solicitudes-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      margin-bottom: 2rem;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0;

        i {
          color: #0d6efd;
        }
      }
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6c757d;

      i {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      p {
        margin-top: 1rem;
        color: #adb5bd;
      }
    }

    .solicitudes-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .solicitud-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    }

    .solicitud-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: linear-gradient(135deg, rgba(13, 110, 253, 0.05) 0%, rgba(10, 88, 202, 0.05) 100%);
      border-bottom: 1px solid rgba(13, 110, 253, 0.2);

      .solicitud-info {
        flex: 1;

        .badge {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 0.5rem;

          &.badge-pendiente {
            background: #fff3cd;
            color: #856404;
          }

          &.badge-aceptada {
            background: #d1e7dd;
            color: #0f5132;
          }

          &.badge-rechazada {
            background: #f8d7da;
            color: #842029;
          }
        }

        h5 {
          margin: 0.5rem 0;
          font-weight: 600;
          color: #212529;
        }

        .fecha {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          font-size: 0.875rem;
          color: #6c757d;

          i {
            color: #adb5bd;
          }
        }
      }
    }

    .solicitud-body {
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;

      h6 {
        margin-bottom: 0.75rem;
        font-weight: 600;
        color: #495057;
      }

      p {
        margin: 0;
        color: #212529;
        line-height: 1.6;
      }
    }

    .solicitud-details {
      padding: 1.5rem;
    }

    .solicitud-actions {
      margin-top: 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1.25rem;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.2s ease;

        i {
          font-size: 1.1rem;
        }

        &:hover {
          transform: translateY(-2px);
        }
      }
    }

    @media (max-width: 768px) {
      .solicitudes-container {
        padding: 1rem;
      }

      .solicitud-actions {
        flex-direction: column;

        .btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `]
})
export class SolicitudesProfesionalComponent implements OnInit {
  solicitudes: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  idProfesional: number = 0; // Obtener del servicio de autenticación

  constructor(private http: HttpClient) {}

  async ngOnInit(): Promise<void> {
    // TODO: Obtener idProfesional del servicio de autenticación
    // this.idProfesional = this.authService.currentUser().idProfesional;
    
    await this.cargarSolicitudes();
  }

  async cargarSolicitudes(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const url = `${environment.apiUrl}/api/v1/solicitudes/profesional/${this.idProfesional}/con-ubicacion`;
      
      // ✅ Manejar correctamente el Promise
      const result = await this.http.get<any[]>(url).toPromise();
      this.solicitudes = result || [];
      
      // Agregar propiedad para controlar detalles expandibles
      this.solicitudes.forEach(s => s.mostrarDetalles = false);
      
      console.log('✅ Solicitudes cargadas:', this.solicitudes);
    } catch (error: any) {
      console.error('❌ Error cargando solicitudes:', error);
      this.error = 'Error al cargar las solicitudes';
      this.solicitudes = [];
    } finally {
      this.loading = false;
    }
  }

  toggleDetalles(idSolicitud: number): void {
    const solicitud = this.solicitudes.find(s => s.idSolicitud === idSolicitud);
    if (solicitud) {
      solicitud.mostrarDetalles = !solicitud.mostrarDetalles;
    }
  }

  async aceptarSolicitud(idSolicitud: number): Promise<void> {
    if (!confirm('¿Estás seguro de que deseas aceptar esta solicitud?')) {
      return;
    }

    try {
      // ✅ Usar el endpoint correcto
      await this.http.put(
        `${environment.apiUrl}/api/v1/solicitudes/responder/${idSolicitud}?aceptada=true`,
        {}
      ).toPromise();

      alert('✅ Solicitud aceptada correctamente');
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
      // ✅ Usar el endpoint correcto
      await this.http.put(
        `${environment.apiUrl}/api/v1/solicitudes/responder/${idSolicitud}?aceptada=false`,
        {}
      ).toPromise();

      alert('✅ Solicitud rechazada');
      await this.cargarSolicitudes();
    } catch (error) {
      console.error('❌ Error al rechazar solicitud:', error);
      alert('Error al rechazar la solicitud');
    }
  }

  iniciarChat(solicitud: any): void {
    // TODO: Navegar al chat con el cliente
    console.log('Iniciar chat con:', solicitud);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}