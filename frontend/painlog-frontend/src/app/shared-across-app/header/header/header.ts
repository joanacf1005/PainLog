import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../auth/supabase';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  async logout() {
    await this.supabaseService.signOut();
    await this.router.navigate(['/login']);
  }
}
