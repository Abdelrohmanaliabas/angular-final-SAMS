import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStorageService } from '../../core/auth/token-storage.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NotificationBellComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  dropdown = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly theme = inject(ThemeService);

  constructor() {
    this.theme.init();
  }

  get themeLabel(): string {
    return this.theme.darkMode() ? 'Light mode' : 'Dark mode';
  }

  get userName(): string {
    return this.tokenStorage.getUser()?.name ?? 'Staff User';
  }

  get userEmail(): string {
    return this.tokenStorage.getUser()?.email ?? 'staff@example.com';
  }

  get userRoleLabel(): string {
    const roles = this.tokenStorage.getUser()?.roles ?? [];
    return roles[0] ?? 'Staff';
  }

  get userInitials(): string {
    const name = this.userName.trim();
    if (!name) {
      return 'ST';
    }
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.dropdown = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.dropdown = false;
        this.router.navigate(['/login']);
      }
    });
  }
}
