
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Star, User, Calendar, ThumbsUp } from 'lucide-angular';
import { ResenaHttpRepository, Resena } from '../../../data/profesionales/resena.http.repository';
import { AuthService } from '../../../domain/auth/auth.service';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, LucideAngularModule],
  templateUrl: './resenas.component.html',
  styleUrl: './resenas.component.scss'
})
export class ResenasComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Star = Star;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly ThumbsUp = ThumbsUp;

  private readonly router = inject(Router);

  promedioCalificacion: number = 0;
  totalResenas: number = 0;
  resenas: Resena[] = [];
  loading: boolean = true;
  error: string | null = null;

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

  private readonly resenaRepo = inject(ResenaHttpRepository);
  private readonly authService = inject(AuthService);


  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const idProfesional = user?.idProfesional;
    if (!idProfesional) {
      this.error = 'No se encontró el profesional.';
      this.loading = false;
      return;
    }
    this.resenaRepo.getPromedioProfesional(idProfesional).subscribe({
      next: promedio => {
        this.promedioCalificacion = promedio;
      },
      error: () => {
        this.error = 'Error al obtener el promedio de calificaciones.';
      }
    });
    this.resenaRepo.getReseniasDeProfesional(idProfesional).subscribe({
      next: resenas => {
        // Ordenar por fecha descendente (más recientes primero)
        this.resenas = resenas.sort((a, b) => {
          const fechaA = new Date(a.fecha).getTime();
          const fechaB = new Date(b.fecha).getTime();
          return fechaB - fechaA;
        });
        this.totalResenas = resenas.length;
        this.totalPages = Math.ceil(resenas.length / this.itemsPerPage);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al obtener las reseñas.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/profesionales/dashboard']);
  }

  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  // Helper for templates: floors a decimal rating before building stars
  getStarsArrayFromRating(rating: number): boolean[] {
    return this.getStarsArray(Math.floor(rating));
  }

  // Métodos de paginación
  getPaginatedResenas(): Resena[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.resenas.slice(start, end);
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
