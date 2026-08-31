import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, FileText, Download, Eye, Calendar } from 'lucide-angular';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from 'src/app/domain/auth/auth.service';
import { PDFGeneratorService } from 'src/app/domain/pago/pdf-generator.service';

interface Factura {
  nroFactura: number;
  fecha: string;
  monto: number;
  cliente: string;
}

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.scss'
})
export class FacturasComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly FileText = FileText;
  readonly Download = Download;
  readonly Eye = Eye;
  readonly Calendar = Calendar;

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly pdfGenerator = inject(PDFGeneratorService);

  facturas: Factura[] = [];
  fechaDesde: string = '';
  fechaHasta: string = '';
  idProfesional: number | null = null;
  loading: boolean = false;

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.idProfesional = user?.idProfesional ?? null;
    // Cargar facturas inicialmente sin filtro de fecha
    if (this.idProfesional) {
      this.cargarFacturas();
    }
  }

  goBack() {
    this.router.navigate(['/profesionales/dashboard']);
  }

  cargarFacturas() {
    if (!this.idProfesional) {
      console.error('No hay profesional autenticado');
      return;
    }

    this.loading = true;
    
    // Si no hay fechas, usar rango de los últimos 30 días
    const ahora = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(ahora.getDate() - 30);
    
    const desde = this.fechaDesde ? new Date(this.fechaDesde) : hace30Dias;
    const hasta = this.fechaHasta ? new Date(this.fechaHasta) : ahora;
    
    let params = new HttpParams()
      .set('idProfesional', this.idProfesional.toString())
      .set('desde', desde.toISOString())
      .set('hasta', hasta.toISOString());

    const url = 'http://localhost:8081/api/v1/pagos/historial-ingresos';
    
    this.http.get<Factura[]>(url, { params }).subscribe({
      next: (data) => {
        // Ordenar por fecha descendente (más recientes primero)
        this.facturas = data.sort((a, b) => {
          const fechaA = new Date(a.fecha).getTime();
          const fechaB = new Date(b.fecha).getTime();
          return fechaB - fechaA;
        });
        this.totalPages = Math.ceil(this.facturas.length / this.itemsPerPage);
        this.currentPage = 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar facturas:', error);
        this.facturas = [];
        this.loading = false;
      }
    });
  }

  verFactura(factura: Factura) {
    console.log('Ver factura:', factura);
  }

  descargarFactura(factura: Factura) {
    console.log('Descargar factura:', factura);
  }

  descargarComprobante(nroFactura: number): void {
    this.pdfGenerator.descargarComprobante(nroFactura);
  }

  // Métodos de paginación
  getPaginatedFacturas(): Factura[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.facturas.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    
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
}
