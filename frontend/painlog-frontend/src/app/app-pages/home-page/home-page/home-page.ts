import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { SupabaseService } from '../../../auth/supabase';
import { EntriesStats, KpiCards } from '../../../shared-across-app/kpi-cards/kpi-cards';

interface DailyEntryView {
  id: string;
  painIntensity?: number | null;
  painType?: string | null;
  painLocation?: string | null;
  hasTakenMedication?: boolean | null;
  created_at?: string | null;
  medicationName?: string | null;
  medicationDosage?: string | null;
  medicationText?: string;
  energyLevel?: number | null;
  sleepHours?: number | null;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, CommonModule, NgClass, KpiCards],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  stats: EntriesStats = {
    avgIntensity: 0,
    avgIntPerMonth: 0,
    entriesPerMonth: 0,
  };

  loading = true;
  userName = 'User';
  firstName = 'User';
  dailyEntry: DailyEntryView | null = null;

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
    await this.loadDailyEntry();
  }

  private async loadDailyEntry(): Promise<void> {
    this.loading = true;

    try {
      const { data, error } = await this.supabaseService.getUser();

      if (error || !data.user) {
        this.dailyEntry = null;
        return;
      }

      const user = data.user;
      const metadata = user.user_metadata as any;

      this.userName =
        `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim() || 'User';
      this.firstName = this.userName.split(' ')[0] || 'User';

      const { data: entries, error: entriesError } =
        await this.supabaseService.getTodaysPainEntry(user.id);

      if (entriesError || !entries || entries.length === 0) {
        this.dailyEntry = null;
        return;
      }

      const entry = entries[0];
      this.dailyEntry = {
        ...entry,
        medicationText: entry.hasTakenMedication
          ? 'Medication taken.'
          : 'No medication taken.',
      };
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  openDeleteModal(id: string): void {
    this.entryToDeleteId = id;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.entryToDeleteId = null;
    this.cdr.markForCheck();
  }

  async confirmDelete(): Promise<void> {
    if (!this.entryToDeleteId) return;

    const { error } = await this.supabaseService.deletePainEntry(this.entryToDeleteId);

    if (!error) {
      this.closeDeleteModal();
      await this.loadDailyEntry();
      return;
    }

    this.closeDeleteModal();
    this.cdr.markForCheck();
  }

  getIntensityClass(value?: number | null): string {
    const safeValue = value ?? 0;
    if (safeValue === 0) return 'pain-zero';
    if (safeValue <= 3) return 'pain-low';
    if (safeValue <= 6) return 'pain-medium';
    return 'pain-high';
  }

  getEnergyClass(value?: number | null): string {
    const safeValue = value ?? 0;
    if (safeValue <= 1) return 'energy-low';
    if (safeValue <= 3) return 'energy-medium';
    return 'energy-high';
  }
}