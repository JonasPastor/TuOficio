import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, CheckCircle } from 'lucide-angular';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="pago-result-container">
      <div class="result-card">
        <div class="icon-success">
          <lucide-angular [img]="CheckCircle" [size]="80"></lucide-angular>
        </div>
        <h1 class="title">¡Pago Exitoso!</h1>
        <p class="message">Tu pago ha sido procesado correctamente.</p>
        <p class="redirect-message">Serás redirigido a tus trabajos en {{ countdown }} segundos...</p>
        <button class="btn btn-primary btn-lg mt-3" (click)="volverATrabajos()">
          Volver Ahora
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pago-result-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .result-card {
      background: white;
      border-radius: 20px;
      padding: 60px 40px;
      text-align: center;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .icon-success {
      color: #10b981;
      margin-bottom: 30px;
      animation: scaleIn 0.5s ease-out;
    }

    .title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 20px;
    }

    .message {
      font-size: 1.2rem;
      color: #6b7280;
      margin-bottom: 15px;
    }

    .redirect-message {
      font-size: 1rem;
      color: #9ca3af;
      margin-bottom: 20px;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `]
})
export class PagoExitosoPage implements OnInit {
  CheckCircle = CheckCircle;
  countdown = 10;
  private intervalId: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  private startCountdown(): void {
    this.intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.intervalId);
        this.volverATrabajos();
      }
    }, 1000);
  }

  volverATrabajos(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.router.navigate(['/trabajos/finalizados']);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
