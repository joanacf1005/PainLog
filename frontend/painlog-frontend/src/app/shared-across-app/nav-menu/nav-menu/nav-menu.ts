import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../../auth/supabase';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.css'
})
export class NavMenu implements OnInit {
  userName = 'User';
  
  private supabaseService = inject(SupabaseService);

  async ngOnInit() {
    try {
      const { data } = await this.supabaseService.getUser();
      const user = data.user;
      
      if (user && user.user_metadata) {
        const metadata = user.user_metadata as any;
        this.userName = `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim() || 'User';
      }
    } catch (error) {
      console.error('Error loading user:', error);
      this.userName = 'User';
    }
  }
}
