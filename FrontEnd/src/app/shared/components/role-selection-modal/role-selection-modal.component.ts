import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, Briefcase } from 'lucide-angular';

@Component({
  selector: 'app-role-selection-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './role-selection-modal.component.html',
  styleUrl: './role-selection-modal.component.scss'
})
export class RoleSelectionModalComponent {
  readonly User = User;
  readonly Briefcase = Briefcase;

  isVisible = signal(true);

  // Output events
  roleSelected = output<'cliente' | 'profesional'>();

  selectRole(role: 'cliente' | 'profesional') {
    this.isVisible.set(false);
    this.roleSelected.emit(role);
  }
}
