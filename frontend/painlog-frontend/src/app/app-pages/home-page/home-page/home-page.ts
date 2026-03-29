import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from '../../../auth/supabase';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  userName = 'User';
  firstName = 'User';

  private supabaseService = inject(SupabaseService);

  async ngOnInit() {
    const { data } = await this.supabaseService.getUser();
    const user = data.user;

    if (user) {
      const metadata = user.user_metadata as any;
      this.userName =
        `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim() || 'User';
      this.firstName = this.userName.split(' ')[0] || 'User';
    }
  }
}
