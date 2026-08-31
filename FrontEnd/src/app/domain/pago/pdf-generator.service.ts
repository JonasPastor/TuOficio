import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FacturaPDF } from './factura-pdf.model';

@Injectable({
  providedIn: 'root'
})
export class PDFGeneratorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/pagos`;

  // ============================
  // COLORES GLOBALES (app.scss)
  // ============================
  private readonly COLOR_PRIMARY = '#1e293b';      // Azul oscuro principal
  private readonly COLOR_SECONDARY = '#0f172a';    // Aún más oscuro
  private readonly COLOR_ACCENT = '#3b82f6';        // Azul brillante
  private readonly COLOR_TEXT_DARK = '#0f172a';
  private readonly COLOR_TEXT_MEDIUM = '#475569';
  private readonly COLOR_TEXT_LIGHT = '#64748b';
  private readonly COLOR_BORDER_LIGHT = '#e2e8f0';
  private readonly COLOR_SUCCESS = '#10b981';

  obtenerDatosFacturaPDF(nroFactura: number): Observable<FacturaPDF> {
    return this.http.get<FacturaPDF>(`${this.apiUrl}/factura/${nroFactura}/pdf`);
  }

  descargarComprobante(nroFactura: number): void {
    this.obtenerDatosFacturaPDF(nroFactura).subscribe({
      next: (factura) => {
        this.generarPDF(factura);
      },
      error: (error) => {
        console.error('Error al obtener los datos de la factura:', error);
      }
    });
  }

  async generarPDF(factura: FacturaPDF): Promise<void> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 595;   // A4 width
    canvas.height = 842;  // A4 height

    // ============================
    // Cargar logo blanco
    // ============================
    const logoBase64 = await this.cargarImagenBase64('assets/logos/logo-blanco.png');

    // Fondo general suave
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ============================
    // ENCABEZADO
    // ============================
    ctx.fillStyle = this.COLOR_PRIMARY;
    ctx.fillRect(0, 0, canvas.width, 115);

    // Logo blanco
    if (logoBase64) {
      const logoImg = new Image();
      logoImg.src = logoBase64;
      await new Promise(resolve => logoImg.onload = resolve);
      ctx.drawImage(logoImg, 40, 22, 70, 70);
    }

    // Nombre App
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Tu Oficio', 130, 55);

    ctx.font = '14px Arial';
    ctx.fillText('Comprobante electrónico', 130, 82);

    // ============================
    // TARJETA PRINCIPAL
    // ============================
    this.drawRoundedRect(ctx, 30, 130, canvas.width - 60, 660, 14, '#ffffff');

    // Título
    ctx.fillStyle = this.COLOR_TEXT_DARK;
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Factura de Servicio', canvas.width / 2, 170);

    // Datos generales
    ctx.font = '14px Arial';
    ctx.fillStyle = this.COLOR_TEXT_MEDIUM;
    ctx.fillText(`Factura Nº ${factura.nroFactura}`, canvas.width / 2, 200);

    const fecha = new Date(factura.fecha);
    ctx.fillText(`Fecha: ${fecha.toLocaleDateString('es-AR')}`, canvas.width / 2, 220);

    this.drawLine(ctx, 70, 250, canvas.width - 70, this.COLOR_BORDER_LIGHT);

    // ============================
    // Datos del cliente
    // ============================
    ctx.textAlign = 'left';
    ctx.fillStyle = this.COLOR_TEXT_DARK;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Cliente', 70, 290);

    ctx.font = '14px Arial';
    ctx.fillStyle = this.COLOR_TEXT_MEDIUM;
    ctx.fillText(factura.nombreCliente, 70, 315);

    // ============================
    // Profesional
    // ============================
    ctx.fillStyle = this.COLOR_TEXT_DARK;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Profesional', 70, 360);

    ctx.font = '14px Arial';
    ctx.fillStyle = this.COLOR_TEXT_MEDIUM;
    ctx.fillText(factura.nombreProfesional, 70, 385);

    // ============================
    // Servicio
    // ============================
    ctx.fillStyle = this.COLOR_TEXT_DARK;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Servicio', 70, 430);

    ctx.font = '14px Arial';
    ctx.fillStyle = this.COLOR_TEXT_MEDIUM;
    this.wrapText(ctx, factura.descripcionServicio, 70, 455, canvas.width - 110, 18);

    // ============================
    // Medio de pago
    // ============================
    ctx.fillStyle = this.COLOR_TEXT_DARK;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Medio de Pago', 70, 520);

    ctx.font = '14px Arial';
    ctx.fillStyle = this.COLOR_TEXT_MEDIUM;
    ctx.fillText(factura.medioPago, 70, 545);

    this.drawLine(ctx, 70, 580, canvas.width - 70, this.COLOR_BORDER_LIGHT);

    // ============================
    // BLOQUE PREMIUM MONTO TOTAL
    // ============================
    this.drawRoundedRect(ctx, 70, 600, canvas.width - 140, 120, 12, this.COLOR_PRIMARY);

    // Sombra interior (simula relieve)
    ctx.fillStyle = this.COLOR_SECONDARY + '33';
    this.drawRoundedRect(ctx, 70, 600, canvas.width - 140, 120, 12, this.COLOR_SECONDARY + '22');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('MONTO TOTAL', canvas.width / 2, 635);

    const monto = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(factura.importe);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Arial';
    ctx.fillText(monto, canvas.width / 2, 680);

    // ============================
    // ESTADO DEL PAGO
    // ============================
    ctx.fillStyle = this.COLOR_SUCCESS;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Estado del pago: ${factura.estadoPago}`, canvas.width / 2, 755);

    // ============================
    // FOOTER
    // ============================
    ctx.fillStyle = this.COLOR_TEXT_LIGHT;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Gracias por utilizar Tu Oficio', canvas.width / 2, 805);
    ctx.fillText('Este comprobante es válido como constancia de pago', canvas.width / 2, 825);

    // ============================
    // Exportar PDF
    // ============================
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = (window as any).jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    pdf.save(`Factura_${factura.nroFactura}_${factura.nombreCliente.replace(/\s/g, '_')}.pdf`);
  }

  // ============================
  // UTILIDADES
  // ============================
  private cargarImagenBase64(path: string): Promise<string | null> {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = path;

      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
      };

      img.onerror = () => resolve(null);
    });
  }

  private drawLine(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lh: number) {
    const words = text.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxWidth) {
        ctx.fillText(line, x, y);
        line = word + ' ';
        y += lh;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }
}
