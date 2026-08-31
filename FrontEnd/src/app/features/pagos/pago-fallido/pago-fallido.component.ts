import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, XCircle, Home, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-pago-fallido',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pago-fallido.component.html',
  styleUrl: './pago-fallido.component.scss'
})
export class PagoFallidoComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly XCircle = XCircle;
  readonly Home = Home;
  readonly RefreshCw = RefreshCw;

  paymentId: string | null = null;
  status: string | null = null;
  statusDetail: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || null;
      this.status = params['status'] || null;
      this.statusDetail = params['status_detail'] || null;

      console.log('Pago fallido:', {
        paymentId: this.paymentId,
        status: this.status,
        statusDetail: this.statusDetail
      });
    });
  }

  volverAlInicio(): void {
    this.router.navigate(['/home']);
  }

  intentarNuevamente(): void {
    // Volver a la pantalla anterior o a mis solicitudes
    this.router.navigate(['/solicitudes']);
  }
}
