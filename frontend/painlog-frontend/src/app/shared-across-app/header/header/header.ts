import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../auth/supabase';
import { AuthState } from '../../../auth/auth-state/auth-state';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private authState = inject(AuthState);

  isDarkMode = false;
  showLogoutModal = false;

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  async confirmLogout(): Promise<void> {
    await this.supabaseService.signOut();
    this.authState.setLoggedIn(false);
    this.showLogoutModal = false;
    await this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    if (typeof window !== 'undefined') {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
    }
  }
}