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

  showDeleteModal = false;
  entryToDeleteId: string | null = null;
  todayLabel = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

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

  openDeleteModal(id: string) {
    this.entryToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.entryToDeleteId = null;
  }

  async confirmDelete() {
    if (!this.entryToDeleteId) return;

    const { error } = await this.supabaseService.deletePainEntry(this.entryToDeleteId);

    if (!error) {
      this.dailyEntry = null;
    }

    this.closeDeleteModal();
  }
}