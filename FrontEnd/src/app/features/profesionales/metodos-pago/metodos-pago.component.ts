import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, CreditCard, Plus, Trash2, CheckCircle } from 'lucide-angular';

interface MetodoPago {
  id: number;
  tipo: 'tarjeta' | 'banco' | 'efectivo';
  nombre: string;
  detalles: string;
  predeterminado: boolean;
}

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './metodos-pago.component.html',
  styleUrl: './metodos-pago.component.scss'
})
export class MetodosPagoComponent {
  readonly ArrowLeft = ArrowLeft;
  readonly CreditCard = CreditCard;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly CheckCircle = CheckCircle;

  private readonly router = inject(Router);

  showAddForm = signal(false);

  metodosPago: MetodoPago[] = [
    {
      id: 1,
      tipo: 'tarjeta',
      nombre: 'Visa terminada en 4242',
      detalles: 'Vence 12/2026',
      predeterminado: true
    },
    {
      id: 2,
      tipo: 'banco',
      nombre: 'Cuenta Bancaria',
      detalles: 'Banco Galicia - CBU: ...3456',
      predeterminado: false
    }
  ];

  nuevoMetodo = {
    tipo: 'tarjeta' as 'tarjeta' | 'banco' | 'efectivo',
    nombre: '',
    detalles: ''
  };

  goBack() {
    this.router.navigate(['/profesionales/dashboard']);
  }

  toggleAddForm() {
    this.showAddForm.update(value => !value);
  }

  agregarMetodo() {
    if (this.nuevoMetodo.nombre && this.nuevoMetodo.detalles) {
      const newId = Math.max(...this.metodosPago.map(m => m.id), 0) + 1;
      this.metodosPago.push({
        id: newId,
        tipo: this.nuevoMetodo.tipo,
        nombre: this.nuevoMetodo.nombre,
        detalles: this.nuevoMetodo.detalles,
        predeterminado: false
      });

      // Reset form
      this.nuevoMetodo = {
        tipo: 'tarjeta',
        nombre: '',
        detalles: ''
      };
      this.showAddForm.set(false);
    }
  }

  eliminarMetodo(id: number) {
    this.metodosPago = this.metodosPago.filter(m => m.id !== id);
  }

  setPredeterminado(id: number) {
    this.metodosPago = this.metodosPago.map(m => ({
      ...m,
      predeterminado: m.id === id
    }));
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'tarjeta': 'Tarjeta de Crédito/Débito',
      'banco': 'Transferencia Bancaria',
      'efectivo': 'Efectivo'
    };
    return labels[tipo] || tipo;
  }
}
