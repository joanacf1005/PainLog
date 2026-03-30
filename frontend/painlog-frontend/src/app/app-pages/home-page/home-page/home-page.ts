import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../auth/supabase';

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
  dailyEntry: any = null;

  private supabaseService = inject(SupabaseService);

  async ngOnInit() {
    const { data } = await this.supabaseService.getUser();
    const user = data.user;

    if (user) {
      const metadata = user.user_metadata as any;
      this.userName =
        `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim() || 'User';
      this.firstName = this.userName.split(' ')[0] || 'User';

      const { data: entries, error } = await this.supabaseService.getTodaysPainEntry(user.id);

      if (!error && entries && entries.length > 0) {
        this.dailyEntry = entries[0];
      }
    }
  }
}