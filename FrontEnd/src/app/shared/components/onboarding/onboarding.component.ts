import { Component, signal, inject, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, HelpCircle, X, ArrowRight, ArrowLeft } from 'lucide-angular';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Onboarding Button -->
    <button 
      class="onboarding-btn" 
      (click)="toggleOnboarding()"
      [class.active]="isActive()"
      title="Comenzar tour de la aplicación"
    >
      <lucide-angular [img]="HelpCircle" size="20"></lucide-angular>
    </button>

    <!-- Onboarding Tooltip -->
    <div 
      *ngIf="isActive() && currentStep()" 
      class="onboarding-tooltip"
      [class]="'position-' + currentStep()!.position"
      [style.top.px]="tooltipPosition().top"
      [style.left.px]="tooltipPosition().left"
      (click)="$event.stopPropagation()"
    >
      <div class="tooltip-header">
        <span class="step-counter">{{ currentStepIndex() + 1 }} de {{ steps.length }}</span>
        <button class="close-btn" (click)="skipTour()">
          <lucide-angular [img]="X" size="16"></lucide-angular>
        </button>
      </div>

      <div class="tooltip-body">
        <h3 class="tooltip-title">{{ currentStep()!.title }}</h3>
        <p class="tooltip-description">{{ currentStep()!.description }}</p>
      </div>

      <div class="tooltip-footer">
        <button 
          *ngIf="currentStepIndex() > 0"
          class="nav-btn secondary"
          (click)="previousStep()"
        >
          <lucide-angular [img]="ArrowLeft" size="16"></lucide-angular>
          Anterior
        </button>
        
        <button class="skip-btn" (click)="skipTour()">
          Saltar tour
        </button>

        <button 
          *ngIf="currentStepIndex() < steps.length - 1"
          class="nav-btn primary"
          (click)="nextStep()"
        >
          Siguiente
          <lucide-angular [img]="ArrowRight" size="16"></lucide-angular>
        </button>

        <button 
          *ngIf="currentStepIndex() === steps.length - 1"
          class="nav-btn primary"
          (click)="finishTour()"
        >
          ¡Entendido!
        </button>
      </div>

      <div class="tooltip-arrow"></div>
    </div>
  `,
  styles: [`
    .onboarding-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #0d6efd;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
      transition: all 0.3s ease;
      margin-left: 12px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(13, 110, 253, 0.5);
        background: #0b5ed7;
      }

      &.active {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
      }
    }

    .onboarding-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(2px);
      z-index: 999;
      animation: fadeIn 0.3s ease;
    }

    .highlight-overlay {
      position: fixed;
      border: none;
      border-radius: 8px;
      background: transparent;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
      animation: none;
      transform: translateZ(0);
    }

    @keyframes pulse {
      0%, 100% {
        border-color: #0d6efd;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 20px rgba(13, 110, 253, 0.5);
      }
      50% {
        border-color: #0b5ed7;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 30px rgba(11, 94, 215, 0.7);
      }
    }

    .onboarding-tooltip {
      position: fixed;
      max-width: 400px;
      background: rgba(26, 32, 44, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      z-index: 1001;
      animation: slideIn 0.3s ease;
      padding: 0;
      overflow: hidden;
      border: 1px solid rgba(59, 130, 246, 0.3);

      .tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #0d6efd;
        color: white;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);

        .step-counter {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: scale(1.1);
          }
        }
      }

      .tooltip-body {
        padding: 24px 20px;

        .tooltip-title {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
        }

        .tooltip-description {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: #cbd5e0;
        }
      }

      .tooltip-footer {
        display: flex;
        gap: 8px;
        padding: 16px 20px;
        border-top: 1px solid rgba(59, 130, 246, 0.2);
        background: rgba(15, 23, 42, 0.5);

        .skip-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
          margin-right: auto;

          &:hover {
            background: rgba(13, 110, 253, 0.1);
            color: #cbd5e0;
          }
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;

          &.secondary {
            background: rgba(71, 85, 105, 0.8);
            color: #e2e8f0;

            &:hover {
              background: rgba(71, 85, 105, 1);
            }
          }

          &.primary {
            background: #0d6efd;
            color: white;

            &:hover {
              background: #0b5ed7;
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
            }
          }
        }
      }

      .tooltip-arrow {
        position: absolute;
        width: 0;
        height: 0;
        border: 10px solid transparent;
      }

      &.position-bottom .tooltip-arrow {
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: rgba(26, 32, 44, 0.95);
      }

      &.position-top .tooltip-arrow {
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: rgba(26, 32, 44, 0.95);
      }

      &.position-left .tooltip-arrow {
        right: -20px;
        top: 50%;
        transform: translateY(-50%);
        border-left-color: rgba(26, 32, 44, 0.95);
      }

      &.position-right .tooltip-arrow {
        left: -20px;
        top: 50%;
        transform: translateY(-50%);
        border-right-color: rgba(26, 32, 44, 0.95);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class OnboardingComponent {
  // Icons
  readonly HelpCircle = HelpCircle;
  readonly X = X;
  readonly ArrowRight = ArrowRight;
  readonly ArrowLeft = ArrowLeft;

  // State
  isActive = signal(false);
  currentStepIndex = signal(0);
  currentStep = signal<OnboardingStep | null>(null);
  tooltipPosition = signal({ top: 0, left: 0 });

  // Events
  tourCompleted = output<void>();

  // Steps configuration
  steps: OnboardingStep[] = [
    {
      id: 'sidebar',
      title: '🎯 Menú Principal',
      description: 'Accede a tu perfil, trabajos, notificaciones y más. Si eres profesional, también encontrarás tu dashboard aquí.',
      target: '.search-input-wrapper',
      position: 'top'
    },
    {
      id: 'chat',
      title: '💬 Chat en Tiempo Real',
      description: 'Comunícate directamente con los profesionales o clientes. Los mensajes no leídos se mostrarán con un badge.',
      target: '.floating-chat-btn',
      position: 'top'
    },
    {
      id: 'services',
      title: '🛠️ Servicios Populares',
      description: 'Explora nuestra amplia variedad de servicios. Haz clic en cualquier categoría para ver profesionales disponibles.',
      target: '.services-section',
      position: 'bottom'
    },
    {
      id: 'featured',
      title: '⭐ Profesionales Destacados',
      description: 'Conoce a los profesionales más solicitados del mes, todos con excelentes valoraciones y experiencia comprobada.',
      target: '.featured-professionals-section',
      position: 'bottom'
    },
    {
      id: 'search',
      title: '🔍 Búsqueda Rápida',
      description: 'Busca servicios, ubicaciones o profesionales específicos usando nuestra barra de búsqueda.',
      target: '.search-input-wrapper',
      position: 'bottom'
    }
  ];

  toggleOnboarding() {
    if (this.isActive()) {
      this.skipTour();
    } else {
      this.startTour();
    }
  }

  startTour() {
    // Check if user has completed tour before
    const hasCompletedTour = localStorage.getItem('onboarding_completed');
    
    this.isActive.set(true);
    this.currentStepIndex.set(0);
    this.showStep(0);
  }

  showStep(index: number) {
    const step = this.steps[index];
    this.currentStep.set(step);
    
    // Wait for DOM to update and recalculate on scroll
    setTimeout(() => {
      this.calculatePositions(step);
      
      // Scroll element into view if needed
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Recalcular después del scroll
        setTimeout(() => {
          this.calculatePositions(step);
        }, 500);
      }
    }, 100);
  }

  calculatePositions(step: OnboardingStep) {
    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      console.warn(`Target element not found: ${step.target}`);
      return;
    }

    // Obtener posición del elemento relativo al viewport
    const rect = targetElement.getBoundingClientRect();

    // Calculate tooltip position
    const tooltipWidth = 400;
    const tooltipHeight = 280;
    const offset = 20;
    const sidebarWidth = window.innerWidth > 768 ? 250 : 0;
    
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + offset;
        // Para elementos del contenido, mover 250px a la izquierda
        left = rect.left - 250;
        break;
      case 'top':
        // Para tooltips arriba, ajustar para que no tapen la barra de búsqueda
        // Si el step es chat, posicionar más a la izquierda
        if (step.id === 'chat') {
          top = rect.top - tooltipHeight - offset;
          left = rect.left - tooltipWidth - 200; // Moverlo aún más a la izquierda
        } else if (step.id === 'services') {
          // Para services, posicionar más abajo
          top = rect.top + 150; // Bajar 150px
          left = rect.left - 250;
        } else {
          // Para featured y otros, posicionar debajo de la barra de búsqueda
          top = rect.top + 100; // Bajar 100px para no tapar la búsqueda
          left = rect.left - 250;
        }
        break;
      case 'left':
        // Para el chat, ya está bien posicionado, no ajustar
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - offset;
        break;
      case 'right':
        // Para el sidebar, posicionar justo a la derecha del sidebar
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + offset;
        break;
    }

    // Ajustar para que no salga del viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 20;
    
    const maxLeft = viewportWidth - tooltipWidth - padding;
    const minTop = padding;
    const maxTop = viewportHeight - tooltipHeight - padding;
    
    // Ajustar solo si se sale por la derecha (no forzar un mínimo)
    if (left > maxLeft) {
      left = maxLeft;
    }
    
    top = Math.max(minTop, Math.min(top, maxTop));

    console.log('📍 Tooltip position:', { step: step.id, top, left, rectLeft: rect.left, rectRight: rect.right });
    
    this.tooltipPosition.set({ top, left });
  }

  nextStep() {
    if (this.currentStepIndex() < this.steps.length - 1) {
      const nextIndex = this.currentStepIndex() + 1;
      this.currentStepIndex.set(nextIndex);
      this.showStep(nextIndex);
    }
  }

  previousStep() {
    if (this.currentStepIndex() > 0) {
      const prevIndex = this.currentStepIndex() - 1;
      this.currentStepIndex.set(prevIndex);
      this.showStep(prevIndex);
    }
  }

  skipTour() {
    this.isActive.set(false);
    this.currentStep.set(null);
  }

  finishTour() {
    localStorage.setItem('onboarding_completed', 'true');
    this.tourCompleted.emit();
    this.skipTour();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.isActive()) return;

    switch(event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.nextStep();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previousStep();
        break;
      case 'Escape':
        event.preventDefault();
        this.skipTour();
        break;
    }
  }
}
