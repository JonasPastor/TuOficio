import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Clock, DollarSign, Phone, User, Calendar, Star, Eye } from 'lucide-angular';
import { PerfilProfesional, DisponibilidadHorario } from '../../../domain/profesionales/models/perfil-profesional.model';

@Component({
  selector: 'app-professional-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './professional-card.component.html',
  styleUrl: './professional-card.component.scss'
})
export class ProfessionalCardComponent {
  @Input() professional!: PerfilProfesional;
  @Output() contact = new EventEmitter<PerfilProfesional>();
  @Output() viewProfile = new EventEmitter<PerfilProfesional>();

  // Icons
  readonly Clock = Clock;
  readonly DollarSign = DollarSign;
  readonly Phone = Phone;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly Star = Star;
  readonly Eye = Eye;

  showFullSchedule = false;

  get professionalName(): string {
    return `${this.professional.nombre} ${this.professional.apellido}`;
  }

  get hasSpecialties(): boolean {
    return this.professional.especialidades && this.professional.especialidades.length > 0;
  }

  get hasAvailability(): boolean {
    return !!this.professional.disponibilidad && this.professional.disponibilidad.length > 0;
  }

  get sortedDisponibilidad(): DisponibilidadHorario[] {
    if (!this.hasAvailability || !this.professional.disponibilidad) return [];

    const diasOrden = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

    return [...this.professional.disponibilidad].sort((a, b) => {
      const indexA = diasOrden.indexOf(a.diaSemana.toUpperCase());
      const indexB = diasOrden.indexOf(b.diaSemana.toUpperCase());
      return indexA - indexB;
    });
  }

  get availabilityPreview(): DisponibilidadHorario[] {
    return this.sortedDisponibilidad.slice(0, 3);
  }

  get hasMoreAvailability(): boolean {
    return this.sortedDisponibilidad.length > 3;
  }

  toggleSchedule(): void {
    this.showFullSchedule = !this.showFullSchedule;
  }

  onContact(): void {
    this.contact.emit(this.professional);
  }

  onViewProfile(): void {
    this.viewProfile.emit(this.professional);
  }

  formatDayName(dia: string): string {
    const dias: { [key: string]: string } = {
      'LUNES': 'Lun',
      'MARTES': 'Mar',
      'MIÉRCOLES': 'Mié',
      'JUEVES': 'Jue',
      'VIERNES': 'Vie',
      'SÁBADO': 'Sáb',
      'DOMINGO': 'Dom'
    };
    return dias[dia.toUpperCase()] || dia;
  }

  formatTime(time: string): string {
    // Convert 24h format to 12h format (e.g., "15:00" -> "3:00 PM")
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
}
