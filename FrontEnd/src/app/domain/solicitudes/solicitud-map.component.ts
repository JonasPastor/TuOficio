// Guardar en: src/app/domain/solicitudes/solicitud-map.component.ts

import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const L: any;

@Component({
  selector: 'app-solicitud-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <!-- Info de ubicación -->
      <div class="location-info">
        <div class="info-row">
          <i class="bi bi-geo-alt-fill" [class.text-primary]="tieneUbicacion()" [class.text-muted]="!tieneUbicacion()"></i>
          <div class="info-text">
            <strong>{{ getNombreCliente() }}</strong>
            <p *ngIf="tieneUbicacion()">{{ solicitud.direccionCompleta }}</p>
            <p *ngIf="!tieneUbicacion()" class="text-danger">
              <i class="bi bi-exclamation-triangle"></i>
              Ubicación no encontrada
            </p>
          </div>
        </div>
        
        <div class="map-actions" *ngIf="tieneUbicacion()">
          <button 
            class="btn btn-sm btn-outline-primary"
            (click)="abrirEnGoogleMaps()">
            <i class="bi bi-map"></i>
            Google Maps
          </button>
          <button 
            class="btn btn-sm btn-outline-secondary"
            (click)="copiarDireccion()">
            <i class="bi bi-clipboard"></i>
            Copiar
          </button>
        </div>
      </div>

      <!-- Mapa - SIEMPRE VISIBLE -->
      <div class="map-wrapper">
        <div 
          [id]="mapId" 
          class="map">
        </div>
        
        <!-- Overlay cuando no hay ubicación -->
        <div *ngIf="!tieneUbicacion()" class="map-overlay">
          <div class="overlay-content">
            <i class="bi bi-geo-alt-slash"></i>
            <h5>Dirección no encontrada</h5>
            <p>{{ solicitud?.direccionCompleta || 'No se proporcionó dirección' }}</p>
            <small *ngIf="solicitud?.errorUbicacion" class="text-muted">
              {{ solicitud.errorUbicacion }}
            </small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .location-info {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      background: #f8f9fa;
    }

    .info-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.75rem;

      i {
        font-size: 1.5rem;
        flex-shrink: 0;
      }
    }

    .info-text {
      flex: 1;
      min-width: 0;

      strong {
        display: block;
        font-size: 1rem;
        color: #212529;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #6c757d;
        line-height: 1.4;

        &.text-danger {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #dc3545;
          font-weight: 500;
        }
      }
    }

    .map-actions {
      display: flex;
      gap: 0.5rem;
      
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        padding: 0.375rem 0.75rem;
      }
    }

    .map-wrapper {
      position: relative;
      height: 350px;
      background: #e9ecef;
    }

    .map {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 1;
    }

    .map-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      padding: 2rem;
    }

    .overlay-content {
      text-align: center;
      max-width: 400px;

      i {
        font-size: 4rem;
        color: #dc3545;
        margin-bottom: 1rem;
        opacity: 0.7;
      }

      h5 {
        color: #212529;
        font-weight: 600;
        margin-bottom: 0.75rem;
      }

      p {
        color: #6c757d;
        margin: 0.5rem 0;
        line-height: 1.5;
      }

      small {
        display: block;
        margin-top: 1rem;
        font-size: 0.75rem;
        color: #adb5bd;
      }
    }

    @media (max-width: 576px) {
      .map-wrapper {
        height: 280px;
      }

      .map-actions {
        flex-direction: column;

        .btn {
          width: 100%;
          justify-content: center;
        }
      }

      .overlay-content {
        i {
          font-size: 3rem;
        }

        h5 {
          font-size: 1.1rem;
        }

        p {
          font-size: 0.875rem;
        }
      }
    }
  `]
})
export class SolicitudMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() solicitud: any = null;
  @Input() mapId: string = 'map-' + Math.random().toString(36).substr(2, 9);
  
  private map: any = null;
  // Coordenadas por defecto (centro de Argentina)
  private defaultLat = -31.4201;
  private defaultLon = -64.1888;

  ngOnInit(): void {
    if (this.solicitud) {
      console.log('📍 Solicitud recibida:', {
        id: this.solicitud.idSolicitud,
        lat: this.solicitud.latitud,
        lon: this.solicitud.longitud,
        direccion: this.solicitud.direccionCompleta
      });
    }
  }

  ngAfterViewInit(): void {
    // SIEMPRE inicializar el mapa, con o sin coordenadas
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  tieneUbicacion(): boolean {
    return !!(this.solicitud?.latitud && this.solicitud?.longitud);
  }

  getNombreCliente(): string {
    if (!this.solicitud) return 'Cliente';
    return `${this.solicitud.nombreCliente || ''} ${this.solicitud.apellidoCliente || ''}`.trim() || 'Cliente';
  }

  private initMap(): void {
    if (typeof L === 'undefined') {
      console.error('❌ Leaflet no está cargado');
      return;
    }

    try {
      // Usar coordenadas reales o por defecto
      const lat = this.solicitud?.latitud || this.defaultLat;
      const lon = this.solicitud?.longitud || this.defaultLon;
      const zoom = this.tieneUbicacion() ? 15 : 4;

      console.log('🗺️ Creando mapa en:', { lat, lon, zoom, tieneUbicacion: this.tieneUbicacion() });

      // Crear mapa
      this.map = L.map(this.mapId, {
        center: [lat, lon],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false
      });

      // Agregar tiles de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Si tiene ubicación, agregar marcador
      if (this.tieneUbicacion()) {
        const icon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = L.marker([lat, lon], { icon }).addTo(this.map);

        marker.bindPopup(`
          <div style="text-align: center; min-width: 150px; padding: 8px;">
            <strong style="color: #212529;">${this.getNombreCliente()}</strong><br>
            <small style="color: #666; line-height: 1.4;">${this.solicitud.direccionCompleta || ''}</small>
          </div>
        `).openPopup();
      }

      console.log('✅ Mapa creado correctamente');
    } catch (error) {
      console.error('❌ Error al crear mapa:', error);
    }
  }

  abrirEnGoogleMaps(): void {
    if (this.tieneUbicacion()) {
      const url = `https://www.google.com/maps/search/?api=1&query=${this.solicitud.latitud},${this.solicitud.longitud}`;
      window.open(url, '_blank');
    }
  }

  copiarDireccion(): void {
    if (this.solicitud?.direccionCompleta) {
      navigator.clipboard.writeText(this.solicitud.direccionCompleta).then(() => {
        alert('✅ Dirección copiada al portapapeles');
      }).catch(err => {
        console.error('❌ Error al copiar:', err);
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = this.solicitud.direccionCompleta;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          alert('✅ Dirección copiada');
        } catch (err) {
          alert('❌ No se pudo copiar la dirección');
        }
        document.body.removeChild(textArea);
      });
    }
  }
}