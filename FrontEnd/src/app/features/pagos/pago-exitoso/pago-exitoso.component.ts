import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, CheckCircle, Home } from 'lucide-angular';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pago-exitoso.component.html',
  styleUrl: './pago-exitoso.component.scss'
})
export class PagoExitosoComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly CheckCircle = CheckCircle;
  readonly Home = Home;

  paymentId: string | null = null;
  status: string | null = null;
  externalReference: string | null = null;

  ngOnInit(): void {
    // Capturar parámetros de la URL de retorno de Mercado Pago
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || null;
      this.status = params['status'] || null;
      this.externalReference = params['external_reference'] || null;

      console.log('Pago exitoso:', {
        paymentId: this.paymentId,
        status: this.status,
        externalReference: this.externalReference
      });
    });
  }

  volverAlInicio(): void {
    this.router.navigate(['/home']);
  }

  verMisSolicitudes(): void {
    this.router.navigate(['/solicitudes']);
  }
}
