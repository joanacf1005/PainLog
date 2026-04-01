import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);
  private authSubscription: any;

  async ngOnInit(): Promise<void> {
    await this.loadUserFromSession();
    this.cdr.detectChanges();

    this.authSubscription = this.supabaseService.onAuthStateChange(() => {
      this.loadUserFromSession().then(() => this.cdr.detectChanges());
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.subscription?.unsubscribe?.();
  }

  async loadUserFromSession(): Promise<void> {
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