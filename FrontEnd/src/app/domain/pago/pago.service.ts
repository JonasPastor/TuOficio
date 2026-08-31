import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PagoRepository } from './pago.repository';
import { FacturaRequest, PreferenceResponse, MercadoPagoConfig, PagoFactura } from './pago.model';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly repository = inject(PagoRepository);

  crearPreferencia(request: FacturaRequest): Observable<PreferenceResponse> {
    return this.repository.crearPreferencia(request);
  }

  crearPreferenciaYRedirigir(request: FacturaRequest): Observable<PreferenceResponse> {
    return this.repository.crearPreferencia(request).pipe(
      tap((response) => {
        // Redirigir automáticamente a la URL de Mercado Pago
        if (response.initPoint) {
          window.location.href = response.initPoint;
        } else {
          console.error('No se recibió initPoint en la respuesta');
        }
      })
    );
  }

  obtenerConfiguracion(): Observable<MercadoPagoConfig> {
    return this.repository.obtenerConfiguracion();
  }

  historialIngresos(desde: string, hasta: string, idProfesional?: number): Observable<PagoFactura[]> {
    return this.repository.historialIngresos(desde, hasta, idProfesional);
  }

  redirigirAPago(initPoint: string): void {
    if (initPoint) {
      window.location.href = initPoint;
    } else {
      console.error('InitPoint no válido');
    }
  }
}
