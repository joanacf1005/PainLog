import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../../auth/supabase';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-menu.html',
  styleUrls: ['./nav-menu.css']
})
export class NavMenu implements OnInit, OnDestroy {
  userName = 'User';
  loading = true;
  menuOpen = false;

  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);
  private authSubscription: any;

  async ngOnInit(): Promise<void> {
    await this.loadUserFromSession();
    this.loading = false;
    this.cdr.detectChanges();

    this.authSubscription = this.supabaseService.onAuthStateChange(() => {
      this.loading = true;
      this.cdr.detectChanges();

      this.loadUserFromSession().then(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.subscription?.unsubscribe?.();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenuOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.menuOpen = false;
    }
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