import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Users, Briefcase, Package, TrendingUp, Plus, Trash2, Edit, LogOut, Search, X, AlertTriangle, CheckCircle, XCircle, Flag } from 'lucide-angular';
import { AuthService } from '../../../domain/auth';
import { SolicitudRepository } from '../../../domain/solicitudes/solicitud.repository';
import { EstadisticaOficio } from '../../../domain/solicitudes/solicitud.model';
import { UsuarioRepository } from '../../../domain/usuario/usuario.repository';
import { UsuarioMetrica, ProfesionalMetrica } from '../../../domain/usuario/usuario.model';
import { PerfilCliente } from '../../../domain/usuario/models/perfil.model';
import { PerfilProfesional } from '../../../domain/profesionales/models/perfil-profesional.model';
import { OficioRepository } from '../../../domain/oficios/oficio.repository';
import { Oficio } from '../../../domain/oficios/oficio.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NotificacionService } from '../../../data/notificaciones/notificacion.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage implements OnInit {
  // Icons
  readonly Users = Users;
  readonly Briefcase = Briefcase;
  readonly Package = Package;
  readonly TrendingUp = TrendingUp;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly LogOut = LogOut;
  readonly Edit = Edit;
  readonly Search = Search;
  readonly X = X;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Flag = Flag;

  // Services
  private readonly authService = inject(AuthService);
  private readonly solicitudRepository = inject(SolicitudRepository);
  private readonly usuarioRepository = inject(UsuarioRepository);
  private readonly oficioRepository = inject(OficioRepository);
  private readonly notificacionService = inject(NotificacionService);

  // Chart reference
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Signals para datos
  usuarios = signal<UsuarioMetrica[]>([]);
  profesionales = signal<ProfesionalMetrica[]>([]);
  oficios = signal<Oficio[]>([]);
  oficiosMasDemandados = signal<EstadisticaOficio[]>([]);
  reportesPendientes = signal<any[]>([]);
  totalReportes = signal(0);
  reporteEliminado = signal(false);

  // Paginación de usuarios
  paginaUsuariosActual = signal<number>(0);
  usuariosPorPagina = 5;
  hayMasUsuarios = signal<boolean>(false);

  // Paginación de profesionales
  paginaProfesionalesActual = signal<number>(0);
  profesionalesPorPagina = 5;
  hayMasProfesionales = signal<boolean>(false);

  // Búsqueda de clientes y profesionales
  busquedaCliente = signal<string>('');
  busquedaProfesional = signal<string>('');
  clientesEncontrados = signal<PerfilCliente[]>([]);
  profesionalesEncontrados = signal<PerfilProfesional[]>([]);
  mostrandoResultadosClientes = signal<boolean>(false);
  mostrandoResultadosProfesionales = signal<boolean>(false);

  // Estadísticas
  totalUsuarios = signal(0);
  totalProfesionales = signal(0);
  totalOficios = signal(0);
  totalOficiosActivos = signal(0);

  // Date filters
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');

  // Chart configuration
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384'
      ]
    }]
  };
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // Modal states
  showAddOficioModal = signal(false);
  showEditOficioModal = signal(false);
  selectedOficio = signal<Oficio | null>(null);
  showStrikeModal = signal(false);
  selectedUsuarioForStrike = signal<UsuarioMetrica | PerfilCliente | null>(null);
  showStrikeValidationModal = signal(false);
  showStrikeConfirmModal = signal(false);
  showStrikeSuccessModal = signal(false);
  showStrikeErrorModal = signal(false);
  strikeValidationMessage = signal('');
  strikeErrorMessage = signal('');
  
  // Modales de oficio
  showOficioSuccessModal = signal(false);
  showOficioErrorModal = signal(false);
  oficioModalMessage = signal('');
  oficioErrorMessage = signal('');

  // Form data
  nuevoOficio = {
    nombre: '',
    descripcion: ''
  };

  strikeForm = {
    motivo: ''
  };

  ngOnInit() {
    this.cargarDatos();
    this.cargarReportes();
  }

  cargarDatos() {
    // TODO: Reemplazar con llamadas reales al backend
    this.cargarUsuarios();
    this.cargarProfesionales();
    this.cargarOficios();
    this.cargarOficiosDemandados();
  }

  cargarReportes() {
    this.notificacionService.obtenerReportesPendientes().subscribe({
      next: (reportes) => {
        this.reportesPendientes.set(reportes);
        this.totalReportes.set(reportes.length);
      },
      error: (error) => {
        console.error('Error cargando reportes:', error);
        this.reportesPendientes.set([]);
        this.totalReportes.set(0);
      }
    });
  }

  aplicarFiltroFechas() {
    this.cargarOficiosDemandados();
  }

  limpiarFiltros() {
    this.fechaInicio.set('');
    this.fechaFin.set('');
    this.cargarOficiosDemandados();
  }

  cargarUsuarios() {
    // Cargar totales
    this.usuarioRepository.getMetricasUsuarios().subscribe({
      next: (metricas) => {
        this.totalUsuarios.set(metricas.cantClientes);
        this.totalProfesionales.set(metricas.cantProfesionales);
      },
      error: (error) => {
        console.error('Error cargando métricas de usuarios:', error);
        this.totalUsuarios.set(0);
        this.totalProfesionales.set(0);
      }
    });

    this.cargarPaginaUsuarios();
  }

  cargarPaginaUsuarios() {
    // Cargar usuarios con paginación (pedimos 1 más para saber si hay más páginas)
    const limit = this.usuariosPorPagina + 1;
    const offset = this.paginaUsuariosActual() * this.usuariosPorPagina;
    
    this.usuarioRepository.getUsuariosMetrica(limit, offset).subscribe({
      next: (usuarios) => {
        // Si recibimos más usuarios de los solicitados, hay más páginas
        this.hayMasUsuarios.set(usuarios.length > this.usuariosPorPagina);
        // Solo mostramos los usuarios de la página actual
        this.usuarios.set(usuarios.slice(0, this.usuariosPorPagina));
      },
      error: (error) => {
        console.error('Error cargando lista de usuarios:', error);
        this.usuarios.set([]);
        this.hayMasUsuarios.set(false);
      }
    });
  }

  siguientesPaginaUsuarios() {
    this.paginaUsuariosActual.set(this.paginaUsuariosActual() + 1);
    this.cargarPaginaUsuarios();
  }

  anterioresPaginaUsuarios() {
    if (this.paginaUsuariosActual() > 0) {
      this.paginaUsuariosActual.set(this.paginaUsuariosActual() - 1);
      this.cargarPaginaUsuarios();
    }
  }

  cargarProfesionales() {
    this.cargarPaginaProfesionales();
  }

  cargarPaginaProfesionales() {
    // Cargar profesionales con paginación (pedimos 1 más para saber si hay más páginas)
    const limit = this.profesionalesPorPagina + 1;
    const offset = this.paginaProfesionalesActual() * this.profesionalesPorPagina;
    
    this.usuarioRepository.getProfesionalesMetrica(limit, offset).subscribe({
      next: (profesionales) => {
        // Si recibimos más profesionales de los solicitados, hay más páginas
        this.hayMasProfesionales.set(profesionales.length > this.profesionalesPorPagina);
        // Solo mostramos los profesionales de la página actual
        this.profesionales.set(profesionales.slice(0, this.profesionalesPorPagina));
      },
      error: (error) => {
        console.error('Error cargando lista de profesionales:', error);
        this.profesionales.set([]);
        this.hayMasProfesionales.set(false);
      }
    });
  }

  siguientesPaginaProfesionales() {
    this.paginaProfesionalesActual.set(this.paginaProfesionalesActual() + 1);
    this.cargarPaginaProfesionales();
  }

  anterioresPaginaProfesionales() {
    if (this.paginaProfesionalesActual() > 0) {
      this.paginaProfesionalesActual.set(this.paginaProfesionalesActual() - 1);
      this.cargarPaginaProfesionales();
    }
  }

  buscarCliente() {
    const nombre = this.busquedaCliente().trim();
    if (nombre.length < 2) {
      alert('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    this.usuarioRepository.buscarClientesPorNombre(nombre).subscribe({
      next: (clientes) => {
        this.clientesEncontrados.set(clientes);
        this.mostrandoResultadosClientes.set(true);
        if (clientes.length === 0) {
          alert('No se encontraron clientes con ese nombre');
        }
      },
      error: (error) => {
        console.error('Error buscando clientes:', error);
        this.clientesEncontrados.set([]);
        this.mostrandoResultadosClientes.set(false);
        alert('Error al buscar clientes. Por favor, intente nuevamente.');
      }
    });
  }

  limpiarBusquedaClientes() {
    this.busquedaCliente.set('');
    this.clientesEncontrados.set([]);
    this.mostrandoResultadosClientes.set(false);
  }

  buscarProfesional() {
    const nombre = this.busquedaProfesional().trim();
    if (nombre.length < 2) {
      alert('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    this.usuarioRepository.buscarProfesionalesPorNombre(nombre).subscribe({
      next: (profesionales) => {
        this.profesionalesEncontrados.set(profesionales);
        this.mostrandoResultadosProfesionales.set(true);
        if (profesionales.length === 0) {
          alert('No se encontraron profesionales con ese nombre');
        }
      },
      error: (error) => {
        console.error('Error buscando profesionales:', error);
        this.profesionalesEncontrados.set([]);
        this.mostrandoResultadosProfesionales.set(false);
        alert('Error al buscar profesionales. Por favor, intente nuevamente.');
      }
    });
  }

  limpiarBusquedaProfesionales() {
    this.busquedaProfesional.set('');
    this.profesionalesEncontrados.set([]);
    this.mostrandoResultadosProfesionales.set(false);
  }

  cargarOficios() {
    this.oficioRepository.list().subscribe({
      next: (oficios) => {
        this.oficios.set(oficios);
        this.totalOficios.set(oficios.length);
        this.totalOficiosActivos.set(oficios.filter(o => o.activo).length);
      },
      error: (error) => {
        console.error('Error cargando oficios:', error);
        this.oficios.set([]);
        this.totalOficios.set(0);
        this.totalOficiosActivos.set(0);
      }
    });
  }

  cargarOficiosDemandados() {
    const fechaInicio = this.fechaInicio() || undefined;
    const fechaFin = this.fechaFin() || undefined;

    this.solicitudRepository.getOficiosMasSolicitados(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.oficiosMasDemandados.set(data);
          this.actualizarGrafico(data);
        } else {
          // Si no hay datos, limpiar
          this.oficiosMasDemandados.set([]);
          this.limpiarGrafico();
        }
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.oficiosMasDemandados.set([]);
        this.limpiarGrafico();
      }
    });
  }

  private actualizarGrafico(data: EstadisticaOficio[]) {
    const labels = data.map(item => item.oficio);
    const values = data.map(item => item.cantidadDeSolicitudes);

    this.pieChartData = {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF'
        ]
      }]
    };

    // Actualizar el chart si existe
    this.chart?.update();
  }

  private limpiarGrafico() {
    this.pieChartData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: []
      }]
    };
    this.chart?.update();
  }

  // Gestión de oficios
  abrirModalNuevoOficio() {
    this.nuevoOficio = { nombre: '', descripcion: '' };
    this.showAddOficioModal.set(true);
  }

  cerrarModalNuevoOficio() {
    this.showAddOficioModal.set(false);
  }

  agregarOficio() {
    if (this.nuevoOficio.nombre.trim() && this.nuevoOficio.descripcion.trim()) {
      // TODO: Implementar llamada al backend
      console.log('Agregar oficio:', this.nuevoOficio);
      this.cerrarModalNuevoOficio();
      // Recargar oficios después de agregar
      this.cargarOficios();
    }
  }

  abrirModalEditarOficio(oficio: Oficio) {
    this.selectedOficio.set(oficio);
    this.showEditOficioModal.set(true);
  }

  cerrarModalEditarOficio() {
    this.showEditOficioModal.set(false);
    this.selectedOficio.set(null);
  }

  actualizarOficio() {
    const oficio = this.selectedOficio();
    if (oficio) {
      // TODO: Implementar llamada al backend
      console.log('Actualizar oficio:', oficio);
      this.cerrarModalEditarOficio();
      // Recargar oficios después de actualizar
      this.cargarOficios();
    }
  }

  toggleEstadoOficio(oficio: Oficio) {
    const accion = oficio.activo ? 'desactivar' : 'activar';

    const observable = oficio.activo
      ? this.oficioRepository.desactivar(oficio.id)
      : this.oficioRepository.activar(oficio.id);

    observable.subscribe({
      next: (mensaje) => {
        console.log(mensaje);
        // Actualizar el estado localmente
        oficio.activo = !oficio.activo;
        // Recargar la lista para mantener sincronización
        this.cargarOficios();
        // Mostrar modal de éxito
        this.oficioModalMessage.set(`Oficio ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
        this.showOficioSuccessModal.set(true);
      },
      error: (error) => {
        console.error(`Error al ${accion} oficio:`, error);
        this.oficioErrorMessage.set(`Error al ${accion} el oficio. Por favor, intente nuevamente.`);
        this.showOficioErrorModal.set(true);
      }
    });
  }

  eliminarOficio(id: number) {
    if (confirm('¿Está seguro que desea eliminar este oficio?')) {
      // TODO: Implementar llamada al backend
      console.log('Eliminar oficio:', id);
      this.cargarOficios();
    }
  }

  // Gestión de strikes
  getUsuarioDisplayName(usuario: UsuarioMetrica | PerfilCliente | null): string {
    if (!usuario) return '';
    // UsuarioMetrica uses 'nombre', PerfilCliente uses 'name'
    return (usuario as any).nombre || (usuario as any).name || '';
  }

  abrirModalStrike(usuario: UsuarioMetrica | PerfilCliente) {
    this.selectedUsuarioForStrike.set(usuario);
    this.strikeForm.motivo = '';
    this.showStrikeModal.set(true);
  }

  cerrarModalStrike() {
    this.showStrikeModal.set(false);
    this.selectedUsuarioForStrike.set(null);
    this.strikeForm.motivo = '';
  }

  agregarStrike() {
    const usuario = this.selectedUsuarioForStrike();
    const motivo = this.strikeForm.motivo.trim();

    if (!motivo) {
      this.strikeValidationMessage.set('Por favor, ingrese un motivo para el strike');
      this.showStrikeValidationModal.set(true);
      return;
    }

    if (!usuario) {
      this.strikeValidationMessage.set('No se ha seleccionado un usuario');
      this.showStrikeValidationModal.set(true);
      return;
    }

    if (!usuario.email) {
      this.strikeValidationMessage.set('No se pudo obtener el email del usuario');
      this.showStrikeValidationModal.set(true);
      return;
    }

    // Mostrar modal de confirmación
    this.showStrikeConfirmModal.set(true);
  }

  confirmarStrike() {
    const usuario = this.selectedUsuarioForStrike();
    const motivo = this.strikeForm.motivo.trim();

    this.showStrikeConfirmModal.set(false);

    if (usuario && usuario.email) {
      this.usuarioRepository.agregarStrike(usuario.email, motivo).subscribe({
        next: (mensaje) => {
          console.log(mensaje);
          this.showStrikeSuccessModal.set(true);
          this.cerrarModalStrike();
          // Recargar los datos para reflejar el cambio
          if (this.mostrandoResultadosClientes()) {
            this.buscarCliente();
          } else {
            this.cargarUsuarios();
          }
        },
        error: (error) => {
          console.error('Error al agregar strike:', error);
          this.strikeErrorMessage.set('Error al agregar strike. Por favor, intente nuevamente.');
          this.showStrikeErrorModal.set(true);
        }
      });
    }
  }

  cerrarModalValidacionStrike() {
    this.showStrikeValidationModal.set(false);
    this.strikeValidationMessage.set('');
  }

  cerrarModalConfirmacionStrike() {
    this.showStrikeConfirmModal.set(false);
  }

  cerrarModalExitoStrike() {
    this.showStrikeSuccessModal.set(false);
  }

  cerrarModalErrorStrike() {
    this.showStrikeErrorModal.set(false);
    this.strikeErrorMessage.set('');
  }

  cerrarModalExitoOficio() {
    this.showOficioSuccessModal.set(false);
  }

  cerrarModalErrorOficio() {
    this.showOficioErrorModal.set(false);
  }

  // Gestión de reportes
  eliminarReporte(idReporte: number) {
    this.notificacionService.eliminarReporte(idReporte).subscribe({
      next: () => {
        console.log('Reporte eliminado exitosamente');
        // Mostrar mensaje de éxito
        this.reporteEliminado.set(true);
        setTimeout(() => this.reporteEliminado.set(false), 3000);
        // Recargar los reportes
        this.cargarReportes();
      },
      error: (error) => {
        console.error('Error al eliminar reporte:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
