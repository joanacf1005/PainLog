import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
  loading = true;
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
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    try {
      const { data } = await this.supabaseService.getUser();
      const user = data.user;

      if (!user) {
        this.dailyEntry = null;
        return;
      }

      const metadata = user.user_metadata as any;
      this.userName =
        `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim() || 'User';
      this.firstName = this.userName.split(' ')[0] || 'User';

      const { data: entries, error } =
        await this.supabaseService.getTodaysPainEntryWithMedication(user.id);

      if (!error && entries && entries.length > 0) {
        const dailyEntry = entries[0];
        const relation = dailyEntry.MedicationEntries?.[0];
        const medication = relation?.Medication?.[0];

        this.dailyEntry = {
          ...dailyEntry,
          medicationName: medication?.name ?? null,
          medicationDosage: medication?.dosage ?? null,
          medicationText:
            dailyEntry.hasTakenMedication
              ? medication?.name && medication?.dosage
                ? `Medication taken: ${medication.name} ${medication.dosage}.`
                : 'Medication was taken, but the linked medication could not be found.'
              : 'No medication taken.',
        };
      } else {
        this.dailyEntry = null;
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openDeleteModal(id: string): void {
    this.entryToDeleteId = id;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.entryToDeleteId = null;
    this.cdr.detectChanges();
  }

  async confirmDelete(): Promise<void> {
    if (!this.entryToDeleteId) return;

    const { error } = await this.supabaseService.deletePainEntry(this.entryToDeleteId);

    if (!error) {
      this.dailyEntry = null;
    }

    this.closeDeleteModal();
    this.cdr.detectChanges();
  }
}