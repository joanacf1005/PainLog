import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../../auth/supabase';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-menu.html',
  styleUrl: './nav-menu.css'
})
export class NavMenu implements OnInit, OnDestroy {
  userName = 'User';

  private supabaseService = inject(SupabaseService);
  private authSubscription: any;

  async ngOnInit() {
    await this.loadUserFromSession();

    this.authSubscription = this.supabaseService.onAuthStateChange(() => {
      this.loadUserFromSession();
    });
  }

  ngOnDestroy() {
    this.authSubscription?.subscription?.unsubscribe?.();
  }

  async loadUserFromSession() {
    try {
      const { data: sessionData } = await this.supabaseService.getSession();

      const user = sessionData.session?.user;
      if (!user) {
        this.userName = 'User';
        return;
      }

      const metadata = user.user_metadata as any;
      this.userName =
        `${metadata?.firstName || ''} ${metadata?.lastName || ''}`.trim() || 'User';
    } catch (error) {
      console.error('Error loading user:', error);
      this.userName = 'User';
    }
  }
}
