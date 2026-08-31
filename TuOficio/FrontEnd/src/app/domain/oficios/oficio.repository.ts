import { Observable } from 'rxjs';
import { Oficio } from './oficio.model';

export abstract class OficioRepository {
  abstract list(): Observable<Oficio[]>;
  abstract activar(id: number): Observable<string>;
  abstract desactivar(id: number): Observable<string>;
}
