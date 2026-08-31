import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notificacion, NotificacionResponse, TipoNotificacion, ReporteProfesional } from '../../domain/notificaciones/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private readonly API_URL = environment.apiUrl;
  private readonly STORAGE_KEY = 'notificaciones_estado';
  
  // Señales para el estado reactivo
  notificaciones = signal<Notificacion[]>([]);
  notificacionesNoLeidas = signal<number>(0);
  mensajesNoLeidos = signal<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * Cargar notificaciones del usuario actual
   */
  cargarNotificaciones(idUsuario: number, isProfessional: boolean = false): Observable<Notificacion[]> {
    // Si es profesional, cargar notificaciones de nuevas solicitudes
    if (isProfessional) {
      return this.cargarNotificacionesProfesional(idUsuario);
    }
    
    // Si es cliente, cargar notificaciones de trabajos finalizados
    return this.cargarNotificacionesCliente(idUsuario);
  }

  /**
   * Cargar notificaciones específicas de profesional (nuevas solicitudes)
   */
  private cargarNotificacionesProfesional(idProfesional: number): Observable<Notificacion[]> {
    // Usar el endpoint correcto: /solicitud/{idProfesional}/{estado}
    return this.http.get<any[]>(`${this.API_URL}/api/v1/solicitudes/solicitud/${idProfesional}/PENDIENTE`)
      .pipe(
        map(solicitudes => {
          // Mapear las solicitudes pendientes a notificaciones
          const notificaciones = solicitudes.map((solicitud) => ({
            id: solicitud.idSolicitud,
            tipo: 'NUEVA_SOLICITUD' as TipoNotificacion,
            titulo: 'Nueva Solicitud Recibida',
            mensaje: `${solicitud.nombreUsuario || 'Un cliente'} te ha enviado una solicitud`,
            fecha: new Date(solicitud.fechasolicitud || solicitud.fechaSolicitud),
            leida: false,
            idRelacionado: solicitud.idSolicitud,
            urlAccion: '/profesionales/dashboard?view=solicitudes'
          }));
          
          this.notificaciones.set(notificaciones);
          this.actualizarContadorNoLeidas();
          return notificaciones;
        }),
        catchError(error => {
          // El backend devuelve 404 cuando no hay solicitudes pendientes
          if (error.status === 404) {
            console.log('ℹ️ No hay solicitudes pendientes para el profesional');
          } else {
            console.error('Error cargando notificaciones de profesional:', error);
          }
          
          // Retornar array vacío - esto no es un error crítico
          this.notificaciones.set([]);
          this.actualizarContadorNoLeidas();
          return of([]);
        })
      );
  }

  /**
   * Cargar notificaciones específicas de cliente (trabajos finalizados y cancelados)
   */
  private cargarNotificacionesCliente(idUsuario: number): Observable<Notificacion[]> {
    console.log('🔔 Cargando notificaciones para cliente:', idUsuario);
    
    // Cargar tanto trabajos cancelados como finalizados
    const cancelados$ = this.http.get<any[]>(`${this.API_URL}/api/v1/trabajos/cliente/cancelados/${idUsuario}`)
      .pipe(catchError((error) => {
        console.log('⚠️ Error cargando cancelados:', error);
        return of([]);
      }));
    
    const finalizados$ = this.http.get<any[]>(`${this.API_URL}/api/v1/trabajos/cliente/finalizados/notificaciones/${idUsuario}`)
      .pipe(catchError((error) => {
        console.log('⚠️ Error cargando finalizados:', error);
        return of([]);
      }));

    return forkJoin([cancelados$, finalizados$]).pipe(
      map(([trabajosCancelados, trabajosFinalizados]) => {
        console.log('📦 Trabajos cancelados recibidos:', trabajosCancelados);
        console.log('📦 Trabajos finalizados recibidos:', trabajosFinalizados);
        
        const estadoGuardado = this.cargarEstadoLocal();
        console.log('💾 Estado guardado:', estadoGuardado);
        
        // Notificaciones de trabajos cancelados
        const notifCancelados = trabajosCancelados
          .filter(trabajo => !estadoGuardado.eliminadas.includes(`cancelado_${trabajo.idTrabajo}`))
          .map((trabajo) => ({
            id: trabajo.idTrabajo,
            tipo: 'TRABAJO_CANCELADO' as TipoNotificacion,
            titulo: 'Trabajo Cancelado',
            mensaje: `El profesional ${trabajo.nombreProfesional} canceló tu trabajo de ${trabajo.oficio}`,
            fecha: new Date(trabajo.fechaCancelacion),
            leida: estadoGuardado.leidas.includes(`cancelado_${trabajo.idTrabajo}`),
            idRelacionado: trabajo.idTrabajo,
            motivoCancelacion: trabajo.motivoCancelacion || 'No se especificó motivo'
          }));

        // Notificaciones de trabajos finalizados (solo los no pagados)
        const notifFinalizados = trabajosFinalizados
          .filter(trabajo => {
            console.log(`🔍 Verificando trabajo ${trabajo.idTrabajo}: pagado=${trabajo.pagado}`);
            return !trabajo.pagado && !estadoGuardado.eliminadas.includes(`finalizado_${trabajo.idTrabajo}`);
          })
          .map((trabajo) => ({
            id: trabajo.idTrabajo + 10000, // Sumar 10000 para evitar colisión de IDs
            tipo: 'TRABAJO_FINALIZADO' as TipoNotificacion,
            titulo: 'Trabajo Finalizado',
            mensaje: `${trabajo.nombreProfesional} finalizó tu trabajo de ${trabajo.oficio}. ¡Ya puedes pagarlo!`,
            fecha: new Date(trabajo.fechaFinalizacion),
            leida: estadoGuardado.leidas.includes(`finalizado_${trabajo.idTrabajo}`),
            idRelacionado: trabajo.idTrabajo,
            montoFinal: trabajo.montoFinal,
            urlAccion: `/trabajos/finalizados`
          }));
        
        console.log('✅ Notificaciones canceladas:', notifCancelados.length);
        console.log('✅ Notificaciones finalizadas:', notifFinalizados.length);
        
        const todasNotificaciones = [...notifCancelados, ...notifFinalizados]
          .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        
        console.log('📋 Total notificaciones:', todasNotificaciones);
        
        this.notificaciones.set(todasNotificaciones);
        this.actualizarContadorNoLeidas();
        return todasNotificaciones;
      }),
      catchError(error => {
        console.error('❌ Error cargando notificaciones de cliente:', error);
        this.notificaciones.set([]);
        this.actualizarContadorNoLeidas();
        return of([]);
      })
    );
  }

  /**
   * Marcar notificación como leída
   */
  marcarComoLeida(idNotificacion: number): Observable<void> {
    const notificaciones = this.notificaciones();
    const notificacion = notificaciones.find(n => n.id === idNotificacion);
    
    if (notificacion) {
      notificacion.leida = true;
      this.notificaciones.set([...notificaciones]);
      this.actualizarContadorNoLeidas();
      
      // Guardar en localStorage
      this.guardarNotificacionLeida(notificacion);
    }

    return of(void 0);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): Observable<void> {
    const notificaciones = this.notificaciones().map(n => ({
      ...n,
      leida: true
    }));
    
    this.notificaciones.set(notificaciones);
    this.actualizarContadorNoLeidas();
    
    // Guardar todas en localStorage
    notificaciones.forEach(n => this.guardarNotificacionLeida(n));

    return of(void 0);
  }

  /**
   * Eliminar notificación
   */
  eliminarNotificacion(idNotificacion: number): Observable<void> {
    console.log('🗑️ Eliminando notificación:', idNotificacion);
    const notificacion = this.notificaciones().find(n => n.id === idNotificacion);
    const notificaciones = this.notificaciones().filter(n => n.id !== idNotificacion);
    this.notificaciones.set(notificaciones);
    this.actualizarContadorNoLeidas();

    // Guardar en localStorage
    if (notificacion) {
      console.log('💾 Guardando como eliminada:', notificacion);
      this.guardarNotificacionEliminada(notificacion);
    }

    return of(void 0);
  }

  /**
   * Agregar nueva notificación
   */
  agregarNotificacion(notificacion: Omit<Notificacion, 'id' | 'fecha' | 'leida'>): void {
    const notificaciones = this.notificaciones();
    const nuevaNotificacion: Notificacion = {
      id: Date.now(),
      fecha: new Date(),
      leida: false,
      ...notificacion
    };
    
    this.notificaciones.set([nuevaNotificacion, ...notificaciones]);
    this.actualizarContadorNoLeidas();
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  getNotificacionesNoLeidas(): number {
    return this.notificacionesNoLeidas();
  }

  /**
   * Obtener contador de mensajes no leídos
   */
  getMensajesNoLeidos(): number {
    return this.mensajesNoLeidos();
  }

  /**
   * Actualizar contador de mensajes no leídos
   */
  actualizarMensajesNoLeidos(cantidad: number): void {
    this.mensajesNoLeidos.set(cantidad);
  }

  /**
   * Actualizar contador de notificaciones no leídas
   */
  private actualizarContadorNoLeidas(): void {
    const noLeidas = this.notificaciones().filter(n => !n.leida).length;
    this.notificacionesNoLeidas.set(noLeidas);
  }

  /**
   * Convertir respuesta del backend a modelo del frontend
   */
  private mapearNotificacion(response: NotificacionResponse): Notificacion {
    return {
      id: response.id,
      tipo: response.tipo,
      titulo: response.titulo,
      mensaje: response.mensaje,
      fecha: new Date(response.fecha),
      leida: response.leida,
      idRelacionado: response.idRelacionado,
      urlAccion: response.urlAccion
    };
  }

  /**
   * Cargar estado guardado de notificaciones desde localStorage
   */
  private cargarEstadoLocal(): { leidas: string[], eliminadas: string[] } {
    try {
      const estadoStr = localStorage.getItem(this.STORAGE_KEY);
      return estadoStr ? JSON.parse(estadoStr) : { leidas: [], eliminadas: [] };
    } catch {
      return { leidas: [], eliminadas: [] };
    }
  }

  /**
   * Guardar notificación como leída en localStorage
   */
  private guardarNotificacionLeida(notificacion: Notificacion): void {
    try {
      const estado = this.cargarEstadoLocal();
      const key = this.generarKeyNotificacion(notificacion);
      
      if (!estado.leidas.includes(key)) {
        estado.leidas.push(key);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(estado));
      }
    } catch (error) {
      console.error('Error guardando estado de notificación:', error);
    }
  }

  /**
   * Guardar notificación como eliminada en localStorage
   */
  private guardarNotificacionEliminada(notificacion: Notificacion): void {
    try {
      const estado = this.cargarEstadoLocal();
      const key = this.generarKeyNotificacion(notificacion);
      
      if (!estado.eliminadas.includes(key)) {
        estado.eliminadas.push(key);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(estado));
      }
    } catch (error) {
      console.error('Error guardando estado de notificación:', error);
    }
  }

  /**
   * Generar key única para una notificación
   */
  private generarKeyNotificacion(notificacion: Notificacion): string {
    if (notificacion.tipo === 'TRABAJO_CANCELADO') {
      return `cancelado_${notificacion.idRelacionado}`;
    } else if (notificacion.tipo === 'TRABAJO_FINALIZADO') {
      return `finalizado_${notificacion.idRelacionado}`;
    } else if (notificacion.tipo === 'NUEVA_SOLICITUD') {
      return `solicitud_${notificacion.idRelacionado}`;
    }
    return `notif_${notificacion.id}`;
  }

  /**
   * Enviar reporte de profesional al administrador
   */
  reportarProfesional(reporte: ReporteProfesional): Observable<any> {
    const payload = {
      idProfesional: reporte.idProfesional,
      razon: reporte.razon,
      reportadoPor: reporte.reportadoPor
    };
    
    return this.http.post(`${this.API_URL}/api/v1/reportes`, payload).pipe(
      map(response => {
        console.log('✅ Reporte enviado correctamente:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error al enviar reporte:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener reportes pendientes (para administrador)
   */
  obtenerReportesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/api/v1/reportes/pendientes`);
  }

  /**
   * Obtener todos los reportes (para administrador)
   */
  obtenerTodosLosReportes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/api/v1/reportes`);
  }

  /**
   * Eliminar un reporte (para administrador)
   */
  eliminarReporte(idReporte: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/api/v1/reportes/${idReporte}`);
  }
}
