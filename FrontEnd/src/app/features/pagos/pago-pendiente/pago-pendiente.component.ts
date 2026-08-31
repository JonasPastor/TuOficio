import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Clock, Home } from 'lucide-angular';

@Component({
  selector: 'app-pago-pendiente',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pago-pendiente.component.html',
  styleUrl: './pago-pendiente.component.scss'
})
export class PagoPendienteComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly Clock = Clock;
  readonly Home = Home;

  paymentId: string | null = null;
  status: string | null = null;
  externalReference: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || null;
      this.status = params['status'] || null;
      this.externalReference = params['external_reference'] || null;

      console.log('Pago pendiente:', {
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
