import { Observable } from 'rxjs';
import { FacturaRequest, PreferenceResponse, MercadoPagoConfig, PagoFactura } from './pago.model';

export abstract class PagoRepository {
  abstract crearPreferencia(request: FacturaRequest): Observable<PreferenceResponse>;
  abstract obtenerConfiguracion(): Observable<MercadoPagoConfig>;
  abstract historialIngresos(desde: string, hasta: string, idProfesional?: number): Observable<PagoFactura[]>;
}
