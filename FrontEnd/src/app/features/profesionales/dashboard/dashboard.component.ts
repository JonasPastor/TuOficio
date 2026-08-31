import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  FileText,
  MessageSquare,
  CreditCard,
  Calendar,
  ArrowLeft,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  X as XIcon,
  Check,
  LogOut,
  Play,
  Pause,
  Square,
  Ban,
  Inbox,
  MapPin,
  Filter,
  MoreVertical,
  File,
  Mail,
  MapPinned
} from 'lucide-angular';
import { AuthService } from '../../../domain/auth';
import { GetSolicitudesUseCase } from '../../../domain/solicitudes/use-cases/get-solicitudes.usecase';
import { ResponderSolicitudUseCase } from '../../../domain/solicitudes/use-cases/responder-solicitud.usecase';
import { SolicitudResponse } from '../../../domain/solicitudes/solicitud.model';
import { TrabajoService } from '../../../domain/trabajo/trabajo.service';
import { PagoService } from '../../../domain/pago/pago.service';
import { SolicitudMapComponent } from '../../../domain/solicitudes/solicitud-map.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

interface SolicitudPendiente {
  idSolicitud: number;
  nombreUsuario: string;
  fechasolicitud: string;
  fechaservicio: string;
  direccion: string;
  observacion: string;
  horaReserva?: string;
}

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, SolicitudMapComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class ProfessionalDashboardComponent implements OnInit {
  readonly TrendingUp = TrendingUp;
  readonly DollarSign = DollarSign;
  readonly Users = Users;
  readonly LogOut = LogOut;
  readonly Star = Star;
  readonly FileText = FileText;
  readonly MessageSquare = MessageSquare;
  readonly CreditCard = CreditCard;
  readonly Calendar = Calendar;
  readonly ArrowLeft = ArrowLeft;
  readonly Award = Award;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly XIcon = XIcon;
  readonly Check = Check;
  readonly Play = Play;
  readonly Pause = Pause;
  readonly Square = Square;
  readonly Ban = Ban;
  readonly Inbox = Inbox;
  readonly MapPin = MapPin;
  readonly Filter = Filter;
  readonly MoreVertical = MoreVertical;
  readonly File = File;
  readonly Mail = Mail;
  readonly MapPinned = MapPinned;

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly getSolicitudesUseCase = inject(GetSolicitudesUseCase);
  private readonly responderSolicitudUseCase = inject(ResponderSolicitudUseCase);
  private readonly trabajoService = inject(TrabajoService);
  private readonly pagoService = inject(PagoService);
  private readonly http = inject(HttpClient);

  userName = signal<string>('');
  respondingToSolicitud = signal<number | null>(null);

  // Modal de respuesta
  showResponseModal = signal(false);
  responseModalType = signal<'success' | 'error'>('success');
  responseModalMessage = signal('');

  // Trabajos
  trabajos = signal<any[]>([]);
  isLoadingTrabajos = signal(false);

  // Paginación de trabajos
  currentPageTrabajos = signal(1);
  itemsPerPageTrabajos = 5;
  totalPagesTrabajos = signal(0);

  // Modal de finalizar trabajo
  showFinalizarModal = signal(false);
  trabajoAFinalizar = signal<number | null>(null);
  descripcionFinalizacion = signal('');
  costoFinalTrabajo = signal<number>(0);

  // Modal de cancelar trabajo
  showCancelarModal = signal(false);
  trabajoACancelar = signal<number | null>(null);
  motivoCancelacion = signal('');

  // Loading states para acciones
  actionLoading = signal<number | null>(null);

  // Menu desplegable de acciones
  menuAccionesAbierto = signal<number | null>(null);

  // Modal de confirmación
  showConfirmModal = signal(false);
  confirmModalTitle = signal('');
  confirmModalMessage = signal('');
  confirmModalType = signal<'aceptar' | 'rechazar'>('aceptar');
  confirmModalAction = signal<(() => void) | null>(null);

  // ====== NUEVA FUNCIONALIDAD: Vista de Solicitudes con Mapa ======
  mostrarVistaSolicitudes = signal(false);
  solicitudesConMapa = signal<any[]>([]);
  solicitudSeleccionadaMapa = signal<any>(null);
  isLoadingSolicitudesConMapa = signal(false);
  showDetalleMapaModal = signal(false);
  
  // Pagination
  paginaActual = signal<number>(0);
  tamanioPagina = signal<number>(5);
  totalElementos = signal<number>(0);
  totalPaginas = signal<number>(0);
  tieneSiguientePagina = signal<boolean>(false);
  tieneAnteriorPagina = signal<boolean>(false);
  
  // Computed signal for visible solicitudes (removed, using pagination now)
  solicitudesVisibles = computed(() => this.solicitudesConMapa());

  // Date filters
  fechaDesde = signal<string>(this.getDefaultDesde());
  fechaHasta = signal<string>(this.getDefaultHasta());
  isLoadingMetrics = signal(false);

  metrics = signal<Metric[]>([
    {
      title: 'Ingresos del Período',
      value: '$0',
      change: '0%',
      trend: 'up',
      icon: this.DollarSign
    },
    {
      title: 'Trabajos Completados',
      value: '0',
      change: '0%',
      trend: 'up',
      icon: this.CheckCircle
    },
    {
      title: 'Clientes Únicos',
      value: '0',
      change: '0%',
      trend: 'up',
      icon: this.Users
    },
    {
      title: 'Calificación Promedio',
      value: '-',
      change: '0',
      trend: 'up',
      icon: this.Star
    }
  ]);

  private getDefaultDesde(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  getDefaultHasta(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }



  ngOnInit() {
    const user = this.authService.getCurrentUser();
    console.log('Dashboard - Usuario actual:', user);

    if (user) {
      this.userName.set(`${user.name} ${user.lastName}`);

      if (user.idProfesional) {
        console.log('Dashboard - Cargando datos para profesional ID:', user.idProfesional);
        this.loadTrabajos();
        
        // Verificar si se debe mostrar la vista de solicitudes desde una notificación
        this.route.queryParams.subscribe(params => {
          if (params['view'] === 'solicitudes') {
            console.log('📩 Abriendo vista de solicitudes desde notificación');
            this.verTodasLasSolicitudes();
          }
        });
        // Cargar métricas con rango de fechas por defecto
        this.loadMetrics();
      } else {
        console.warn('Dashboard - Usuario no tiene idProfesional asignado');
      }
    } else {
      console.error('Dashboard - No hay usuario autenticado');
    }
  }

  loadMetrics() {
    const user = this.authService.getCurrentUser();
    if (!user?.idProfesional) return;

    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();

    if (!desde || !hasta) {
      this.showErrorModal('Por favor seleccione un rango de fechas válido');
      return;
    }

    if (new Date(desde) > new Date(hasta)) {
      this.showErrorModal('La fecha "desde" no puede ser mayor a la fecha "hasta"');
      return;
    }

    this.isLoadingMetrics.set(true);
    console.log('📊 Cargando métricas desde:', desde, 'hasta:', hasta);

    this.pagoService.historialIngresos(desde, hasta, user.idProfesional).subscribe({
      next: (pagos) => {
        console.log('✅ Historial de ingresos recibido:', pagos);
        this.calculateMetrics(pagos, user.idProfesional!);
        this.isLoadingMetrics.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar métricas:', error);
        this.isLoadingMetrics.set(false);

        // Si es un 404, mostrar métricas en 0 (no hay datos en ese período)
        if (error.status === 404) {
          this.calculateMetrics([], user.idProfesional!);
        } else {
          const mensajeError = error.error?.message || error.message || 'Error al cargar métricas';
          this.showErrorModal(mensajeError);
        }
      }
    });
  }

  private calculateMetrics(pagos: any[], idProfesional: number) {
    console.log('📊 Calculando métricas con pagos:', pagos);

    // Calcular ingresos totales - todos los pagos retornados ya están aprobados
    const ingresoTotal = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

    // Contar trabajos completados - cada pago representa un trabajo completado
    const trabajosCompletados = pagos.length;

    // Formatear ingresos
    const ingresoFormateado = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(ingresoTotal);

    // Obtener promedio de reseñas
    this.http.get<number>(`${environment.apiUrl}/api/v1/resenias/promedio/${idProfesional}`)
      .subscribe({
        next: (promedio) => {
          console.log('⭐ Promedio de reseñas:', promedio);
          this.actualizarMetricas(ingresoFormateado, trabajosCompletados, ingresoTotal, promedio);
        },
        error: (error) => {
          console.log('⚠️ No hay reseñas para este profesional:', error);
          this.actualizarMetricas(ingresoFormateado, trabajosCompletados, ingresoTotal, null);
        }
      });
  }

  private actualizarMetricas(ingresoFormateado: string, trabajosCompletados: number, ingresoTotal: number, promedioResenias: number | null) {
    this.metrics.set([
      {
        title: 'Ingresos del Período',
        value: ingresoFormateado,
        change: trabajosCompletados > 0 ? `${trabajosCompletados} pago${trabajosCompletados !== 1 ? 's' : ''}` : 'Sin datos',
        trend: 'up',
        icon: this.DollarSign
      },
      {
        title: 'Trabajos Completados',
        value: trabajosCompletados.toString(),
        change: ingresoTotal > 0 ? `Total: ${ingresoFormateado}` : 'Sin ingresos',
        trend: 'up',
        icon: this.CheckCircle
      },
      {
        title: 'Promedio de Reseñas',
        value: promedioResenias !== null ? promedioResenias.toFixed(1) : 'Sin reseñas',
        change: promedioResenias !== null ? `⭐ ${promedioResenias.toFixed(2)} / 5.0` : 'Aún no hay calificaciones',
        trend: promedioResenias !== null && promedioResenias >= 4 ? 'up' : 'down',
        icon: this.Star
      }
    ]);

    console.log('✅ Métricas actualizadas:', {
      ingresoTotal,
      trabajosCompletados,
      promedioResenias
    });
  }

  aplicarFiltroFechas() {
    console.log('🔍 Aplicando filtro de fechas:', this.fechaDesde(), '-', this.fechaHasta());
    this.loadMetrics();
  }

  // ====== NUEVOS MÉTODOS PARA SOLICITUDES CON MAPA ======

  async verTodasLasSolicitudes() {
    this.mostrarVistaSolicitudes.set(true);
    this.paginaActual.set(0);
    await this.cargarSolicitudesConMapa();
  }

  volverAlDashboard() {
    this.mostrarVistaSolicitudes.set(false);
    this.solicitudSeleccionadaMapa.set(null);
    this.paginaActual.set(0);
    this.solicitudesConMapa.set([]);
  }

  async cargarSolicitudesConMapa(pagina?: number) {
    const user = this.authService.getCurrentUser();
    if (!user?.idProfesional) return;

    this.isLoadingSolicitudesConMapa.set(true);

    try {
      const paginaActual = pagina !== undefined ? pagina : this.paginaActual();
      const url = `${environment.apiUrl}/api/v1/solicitudes/profesional/${user.idProfesional}/con-ubicacion/paginado?pagina=${paginaActual}&tamanio=${this.tamanioPagina()}`;
      const result = await this.http.get<any>(url).toPromise();
      
      if (result) {
        this.solicitudesConMapa.set(result.solicitudes || []);
        this.paginaActual.set(result.paginaActual);
        this.totalElementos.set(result.totalElementos);
        this.totalPaginas.set(result.totalPaginas);
        this.tieneSiguientePagina.set(result.tieneSiguiente);
        this.tieneAnteriorPagina.set(result.tieneAnterior);
        console.log('✅ Solicitudes paginadas cargadas:', {
          pagina: result.paginaActual,
          total: result.totalElementos,
          mostradas: result.solicitudes?.length
        });
      }
    } catch (error) {
      console.error('❌ Error cargando solicitudes paginadas:', error);
      this.solicitudesConMapa.set([]);
    } finally {
      this.isLoadingSolicitudesConMapa.set(false);
    }
  }

  async cargarSiguientePagina() {
    if (this.tieneSiguientePagina()) {
      await this.cargarSolicitudesConMapa(this.paginaActual() + 1);
    }
  }

  async cargarPaginaAnterior() {
    if (this.tieneAnteriorPagina()) {
      await this.cargarSolicitudesConMapa(this.paginaActual() - 1);
    }
  }

  verDetalleSolicitudMapa(solicitud: any) {
    console.log('👁️ Abriendo detalle con mapa:', solicitud);
    this.solicitudSeleccionadaMapa.set(solicitud);
    this.showDetalleMapaModal.set(true);
  }

  cerrarDetalleMapaModal() {
    this.showDetalleMapaModal.set(false);
    setTimeout(() => {
      this.solicitudSeleccionadaMapa.set(null);
    }, 300);
  }

  async aceptarSolicitudConMapa(idSolicitud: number) {
    this.confirmModalTitle.set('Aceptar Solicitud');
    this.confirmModalMessage.set('¿Estás seguro de que deseas aceptar esta solicitud? Se creará un trabajo asociado.');
    this.confirmModalType.set('aceptar');
    this.confirmModalAction.set(() => this.confirmarAceptarSolicitud(idSolicitud));
    this.showConfirmModal.set(true);
  }

  private confirmarAceptarSolicitud(idSolicitud: number) {
    this.showConfirmModal.set(false);
    this.respondingToSolicitud.set(idSolicitud);

    this.responderSolicitudUseCase.execute(idSolicitud, true).subscribe({
      next: () => {
        this.crearTrabajo(idSolicitud);
        this.cerrarDetalleMapaModal();
      },
      error: (error) => {
        console.error('❌ Error al aceptar solicitud:', error);
        this.respondingToSolicitud.set(null);
        this.showErrorModal('Error al aceptar la solicitud');
      }
    });
  }

  async rechazarSolicitudConMapa(idSolicitud: number) {
    this.confirmModalTitle.set('Rechazar Solicitud');
    this.confirmModalMessage.set('¿Estás seguro de que deseas rechazar esta solicitud? Esta acción no se puede deshacer.');
    this.confirmModalType.set('rechazar');
    this.confirmModalAction.set(() => this.confirmarRechazarSolicitud(idSolicitud));
    this.showConfirmModal.set(true);
  }

  private confirmarRechazarSolicitud(idSolicitud: number) {
    this.showConfirmModal.set(false);
    this.respondingToSolicitud.set(idSolicitud);

    this.responderSolicitudUseCase.execute(idSolicitud, false).subscribe({
      next: () => {
        this.respondingToSolicitud.set(null);
        this.showSuccessModal('Solicitud rechazada exitosamente');
        this.cerrarDetalleMapaModal();
        this.cargarSolicitudesConMapa();
      },
      error: (error) => {
        console.error('❌ Error al rechazar solicitud:', error);
        this.respondingToSolicitud.set(null);
        this.showErrorModal('Error al rechazar la solicitud');
      }
    });
  }

  executeConfirmAction() {
    const action = this.confirmModalAction();
    if (action) {
      action();
    }
  }

  closeConfirmModal() {
    this.showConfirmModal.set(false);
  }

  // ====== MÉTODOS EXISTENTES ======

  crearTrabajo(idSolicitud: number) {
    this.trabajoService.crearTrabajo(idSolicitud).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo creado:', trabajo);
        this.respondingToSolicitud.set(null);

        this.showSuccessModal('Solicitud aceptada y trabajo creado exitosamente. El profesional debe iniciarlo manualmente.');
        this.loadTrabajos();

        // Recargar también las solicitudes con mapa si está en esa vista
        if (this.mostrarVistaSolicitudes()) {
          this.cargarSolicitudesConMapa();
        }
      },
      error: (error) => {
        console.error('❌ Error al crear trabajo:', error);
        this.respondingToSolicitud.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al crear el trabajo: ${mensajeError}`);
      }
    });
  }

  iniciarTrabajoManual(idTrabajo: number) {
    this.actionLoading.set(idTrabajo);
    this.trabajoService.iniciarTrabajo(idTrabajo).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo iniciado:', trabajo);
        this.actionLoading.set(null);
        this.showSuccessModal('Trabajo iniciado exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al iniciar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al iniciar trabajo: ${mensajeError}`);
      }
    });
  }

  pausarTrabajoManual(idTrabajo: number) {
    this.actionLoading.set(idTrabajo);
    this.trabajoService.pausarTrabajo(idTrabajo).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo pausado:', trabajo);
        this.actionLoading.set(null);
        this.showSuccessModal('Trabajo pausado exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al pausar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al pausar trabajo: ${mensajeError}`);
      }
    });
  }

  reanudarTrabajoManual(idTrabajo: number) {
    this.actionLoading.set(idTrabajo);
    this.trabajoService.reanudarTrabajo(idTrabajo).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo reanudado:', trabajo);
        this.actionLoading.set(null);
        this.showSuccessModal('Trabajo reanudado exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al reanudar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al reanudar trabajo: ${mensajeError}`);
      }
    });
  }

  openFinalizarModal(idTrabajo: number) {
    this.trabajoAFinalizar.set(idTrabajo);
    this.descripcionFinalizacion.set('');
    this.costoFinalTrabajo.set(0);
    this.showFinalizarModal.set(true);
  }

  closeFinalizarModal() {
    this.showFinalizarModal.set(false);
    this.trabajoAFinalizar.set(null);
    this.descripcionFinalizacion.set('');
    this.costoFinalTrabajo.set(0);
  }

  confirmarFinalizarTrabajo() {
    const idTrabajo = this.trabajoAFinalizar();
    const observaciones = this.descripcionFinalizacion();
    const montoFinal = this.costoFinalTrabajo();

    if (!idTrabajo || !observaciones || montoFinal <= 0) {
      this.showErrorModal('Debe completar todos los campos para finalizar el trabajo');
      return;
    }

    this.actionLoading.set(idTrabajo);
    this.trabajoService.finalizarTrabajo(idTrabajo, observaciones, montoFinal).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo finalizado:', trabajo);
        this.crearFacturaTrabajo(trabajo.idSolicitud, trabajo.idTrabajo, trabajo.oficio, montoFinal);
      },
      error: (error) => {
        console.error('❌ Error al finalizar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al finalizar trabajo: ${mensajeError}`);
      }
    });
  }

  crearFacturaTrabajo(idSolicitud: number, idTrabajo: number, oficio: string, monto: number) {
    const facturaRequest = {
      idSolicitud: idSolicitud,
      idTrabajo: idTrabajo,
      titulo: `Pago por servicio de ${oficio}`,
      descripcion: `Trabajo finalizado - ${oficio}`,
      cantidad: 1,
      monto: monto
    };

    console.log('📄 Creando factura:', facturaRequest);

    this.pagoService.crearPreferencia(facturaRequest).subscribe({
      next: (response) => {
        console.log('✅ Factura creada:', response);
        this.actionLoading.set(null);
        this.closeFinalizarModal();
        this.showSuccessModal('Trabajo finalizado y factura creada exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al crear factura:', error);
        this.actionLoading.set(null);
        this.closeFinalizarModal();
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Trabajo finalizado pero error al crear factura: ${mensajeError}`);
        this.loadTrabajos();
      }
    });
  }

  openCancelarModal(idTrabajo: number) {
    this.trabajoACancelar.set(idTrabajo);
    this.motivoCancelacion.set('');
    this.showCancelarModal.set(true);
  }

  closeCancelarModal() {
    this.showCancelarModal.set(false);
    this.trabajoACancelar.set(null);
    this.motivoCancelacion.set('');
  }

  confirmarCancelarTrabajo() {
    const idTrabajo = this.trabajoACancelar();
    const motivo = this.motivoCancelacion();

    if (!idTrabajo || !motivo) {
      this.showErrorModal('Debe proporcionar un motivo para cancelar el trabajo');
      return;
    }

    this.actionLoading.set(idTrabajo);
    this.trabajoService.cancelarTrabajo(idTrabajo, motivo).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo cancelado:', trabajo);
        this.actionLoading.set(null);
        this.closeCancelarModal();
        this.showSuccessModal('Trabajo cancelado exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al cancelar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al cancelar trabajo: ${mensajeError}`);
      }
    });
  }

  showSuccessModal(message: string) {
    this.responseModalType.set('success');
    this.responseModalMessage.set(message);
    this.showResponseModal.set(true);
  }

  showErrorModal(message: string) {
    this.responseModalType.set('error');
    this.responseModalMessage.set(message);
    this.showResponseModal.set(true);
  }

  closeResponseModal() {
    this.showResponseModal.set(false);
  }

  loadTrabajos() {
    const user = this.authService.getCurrentUser();
    if (!user?.idProfesional) return;

    this.isLoadingTrabajos.set(true);
    this.trabajoService.obtenerTrabajosPorProfesional(user.idProfesional).subscribe({
      next: (trabajos) => {
        console.log('✅ Trabajos cargados:', trabajos);
        const trabajosOrdenados = this.ordenarTrabajos(trabajos);
        this.trabajos.set(trabajosOrdenados);
        this.totalPagesTrabajos.set(Math.ceil(trabajosOrdenados.length / this.itemsPerPageTrabajos));
        this.isLoadingTrabajos.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar trabajos:', error);
        this.trabajos.set([]);
        this.isLoadingTrabajos.set(false);
      }
    });
  }

  private ordenarTrabajos(trabajos: any[]): any[] {
    // Definir orden de prioridad de estados
    const ordenEstados: { [key: string]: number } = {
      'EN_CURSO': 1,
      'PAUSADO': 2,
      'PENDIENTE': 3,
      'FINALIZADO': 4,
      'CANCELADO': 5
    };

    return trabajos.sort((a, b) => {
      // Primero ordenar por estado
      const prioridadA = ordenEstados[a.estado] || 999;
      const prioridadB = ordenEstados[b.estado] || 999;

      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }

      // Si tienen el mismo estado, ordenar por fecha (más recientes primero)
      const fechaA = new Date(a.fechaInicio || a.fechaCreacion || 0).getTime();
      const fechaB = new Date(b.fechaInicio || b.fechaCreacion || 0).getTime();

      return fechaB - fechaA; // Descendente (más recientes primero)
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'PENDIENTE': 'badge-pendiente',
      'EN_CURSO': 'badge-en-curso',
      'PAUSADO': 'badge-pausado',
      'FINALIZADO': 'badge-finalizado',
      'CANCELADO': 'badge-cancelado'
    };
    return classes[estado] || 'bg-secondary';
  }

  getBadgeClassSolicitud(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning';
      case 'ACEPTADA': return 'bg-success';
      case 'RECHAZADA': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatMoneda(monto: number | null): string {
    if (monto === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getHoraReserva(hora: string | undefined | null): string {
    if (!hora || hora === 'undefined' || hora === 'null' || hora.trim() === '') {
      return 'No especificada';
    }
    // Formatear hora si viene en formato HH:mm:ss a HH:mm
    if (hora.includes(':')) {
      const parts = hora.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return hora;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-AR');
    }
  }

  formatHora(hora: string): string {
    if (!hora) return '';
    return hora.substring(0, 5);
  }

  goToInvoices() {
    this.router.navigate(['/profesionales/facturas']);
  }

  goToReviews() {
    this.router.navigate(['/profesionales/resenas']);
  }

  goToMessages() {
    this.router.navigate(['/chat']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  toggleMenuAcciones(idTrabajo: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (this.menuAccionesAbierto() === idTrabajo) {
      this.menuAccionesAbierto.set(null);
    } else {
      this.menuAccionesAbierto.set(idTrabajo);
    }
  }

  cerrarMenuAcciones() {
    this.menuAccionesAbierto.set(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Cerrar menú cuando se haga clic fuera
    const target = event.target as HTMLElement;
    if (!target.closest('.position-relative')) {
      this.cerrarMenuAcciones();
    }
  }

  logout() {
    this.authService.logout();
  }

  // Métodos de paginación para trabajos
  getPaginatedTrabajos(): any[] {
    const start = (this.currentPageTrabajos() - 1) * this.itemsPerPageTrabajos;
    const end = start + this.itemsPerPageTrabajos;
    return this.trabajos().slice(start, end);
  }

  goToPageTrabajos(page: number): void {
    if (page >= 1 && page <= this.totalPagesTrabajos()) {
      this.currentPageTrabajos.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPageTrabajos(): void {
    if (this.currentPageTrabajos() < this.totalPagesTrabajos()) {
      this.currentPageTrabajos.set(this.currentPageTrabajos() + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPageTrabajos(): void {
    if (this.currentPageTrabajos() > 1) {
      this.currentPageTrabajos.set(this.currentPageTrabajos() - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbersTrabajos(): number[] {
    const pages: number[] = [];
    const total = this.totalPagesTrabajos();
    const current = this.currentPageTrabajos();
    
    pages.push(1);
    
    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);
    
    if (start > 2) {
      pages.push(-1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < total - 1) {
      pages.push(-1);
    }
    
    if (total > 1) {
      pages.push(total);
    }
    
    return pages;
  }

  // Métodos de paginación mejorados para solicitudes
  goToPageSolicitudes(page: number): void {
    if (page >= 0 && page < this.totalPaginas()) {
      this.cargarSolicitudesConMapa(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbersSolicitudes(): number[] {
    const pages: number[] = [];
    const total = this.totalPaginas();
    const current = this.paginaActual();
    
    if (total === 0) return [];
    
    pages.push(0);
    
    let start = Math.max(1, current - 1);
    let end = Math.min(total - 2, current + 1);
    
    if (start > 1) {
      pages.push(-1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < total - 2) {
      pages.push(-1);
    }
    
    if (total > 1) {
      pages.push(total - 1);
    }
    
    return pages;
  }
}
