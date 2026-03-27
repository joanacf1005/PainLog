import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../../auth/supabase';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  userName = 'User';
  showProfileMenu = false;
  
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  async ngOnInit() {
    const { data } = await this.supabaseService.getUser();
    const user = data.user;
    
    if (user) {
      const metadata = user.user_metadata as any;
      this.userName = `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim() || 'User';
    }
  }

  async logout() {
    this.showProfileMenu = false;
    await this.supabaseService.signOut();
    await this.router.navigate(['/login']);
  }
  
  toggleProfile() {
    this.showProfileMenu = !this.showProfileMenu;
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.showProfileMenu = false;
    }
  }
}
