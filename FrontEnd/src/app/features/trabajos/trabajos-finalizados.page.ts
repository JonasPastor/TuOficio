import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeft,
  FileText,
  DollarSign,
  Star,
  AlertCircle,
  CheckCircle,
  Download,
} from 'lucide-angular';
import { TrabajoService } from '../../domain/trabajo/trabajo.service';
import { TrabajoClienteResponse } from '../../domain/trabajo/trabajo.model';
import { SolicitudService } from '../../domain/solicitudes/solicitud.service';
import { AuthService } from '../../domain/auth';
import { ReseniaModalComponent } from '../home/resenia-modal/resenia-modal.component';
import { PDFGeneratorService } from '../../domain/pago/pdf-generator.service';

@Component({
  selector: 'app-trabajos-finalizados',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ReseniaModalComponent],
  templateUrl: './trabajos-finalizados.page.html',
  styleUrl: './trabajos-finalizados.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrabajosFinalizadosPage implements OnInit {
  private readonly router = inject(Router);
  private readonly trabajoService = inject(TrabajoService);
  private readonly solicitudService = inject(SolicitudService);
  private readonly pdfGenerator = inject(PDFGeneratorService);
  readonly authService = inject(AuthService);

  // Icons
  readonly ArrowLeft = ArrowLeft;
  readonly FileText = FileText;
  readonly DollarSign = DollarSign;
  readonly Star = Star;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;
  readonly Download = Download;

  // State
  trabajosFinalizados = signal<TrabajoClienteResponse[]>([]);
  isLoadingTrabajos = signal(false);
  showReseniaModal = signal(false);
  selectedTrabajoForResenia = signal<{
    trabajo: TrabajoClienteResponse;
    idProfesional: number;
  } | null>(null);

  // Paginación
  currentPage = signal(1);
  itemsPerPage = 5;
  totalPages = signal(0);

  ngOnInit(): void {
    this.loadTrabajosFinalizados();
  }

  private loadTrabajosFinalizados(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) return;

    this.isLoadingTrabajos.set(true);
    this.trabajoService.obtenerTrabajosFinalizadosPorCliente(user.id).subscribe({
      next: (trabajos) => {
        this.trabajosFinalizados.set(trabajos);
        this.totalPages.set(Math.ceil(trabajos.length / this.itemsPerPage));
        this.isLoadingTrabajos.set(false);
      },
      error: (error) => {
        console.error('Error al cargar trabajos finalizados:', error);
        this.isLoadingTrabajos.set(false);
      },
    });
  }

  formatMoneda(monto: string): string {
    const montoNumero = parseFloat(monto);
    if (isNaN(montoNumero)) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(montoNumero);
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: Record<string, string> = {
      PENDIENTE: 'badge-pendiente',
      EN_CURSO: 'badge-en-curso',
      PAUSADO: 'badge-pausado',
      FINALIZADO: 'badge-finalizado',
      CANCELADO: 'badge-cancelado',
    };
    return classes[estado] || 'badge-default';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trabajosPagados(): number {
    return this.trabajosFinalizados().filter(t => t.estadoPago === 'APROBADO').length;
  }

  resenasEnviadas(): number {
    return this.trabajosFinalizados().filter(t => t.tieneResenia).length;
  }

  irAPago(urlPago: string): void {
    if (urlPago) {
      window.open(urlPago, '_blank');
    }
  }

  abrirModalResenia(trabajo: TrabajoClienteResponse): void {
    console.log('🔍 Abriendo modal para trabajo:', trabajo);
    this.solicitudService.getSolicitudById(trabajo.idSolicitud).subscribe({
      next: (solicitud) => {
        console.log('Solicitud recibida:', solicitud);
        const idProfesional = solicitud.idProfesional;
        const dataParaModal = {
          trabajo: trabajo,
          idProfesional,
        };
        console.log('🔍 Datos que se pasarán al modal:', dataParaModal);
        this.selectedTrabajoForResenia.set(dataParaModal);
        this.showReseniaModal.set(true);
      },
      error: (error: any) => {
        console.error('Error al obtener solicitud:', error);
        alert('No se pudo cargar la información del profesional');
      },
    });
  }

  cerrarModalResenia(): void {
    this.showReseniaModal.set(false);
    this.selectedTrabajoForResenia.set(null);
  }

  onReseniaEnviada(): void {
    this.cerrarModalResenia();
    this.loadTrabajosFinalizados();
  }

  descargarComprobante(nroFactura: number): void {
    this.pdfGenerator.descargarComprobante(nroFactura);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // Métodos de paginación
  getPaginatedTrabajos(): TrabajoClienteResponse[] {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.trabajosFinalizados().slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();
    
    // Mostrar siempre la primera página
    pages.push(1);
    
    // Calcular páginas intermedias
    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);
    
    // Agregar puntos suspensivos si hay hueco
    if (start > 2) {
      pages.push(-1); // -1 representa "..."
    }
    
    // Agregar páginas intermedias
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Agregar puntos suspensivos si hay hueco
    if (end < total - 1) {
      pages.push(-1); // -1 representa "..."
    }
    
    // Mostrar siempre la última página si hay más de una
    if (total > 1) {
      pages.push(total);
    }
    
    return pages;
  }
}
