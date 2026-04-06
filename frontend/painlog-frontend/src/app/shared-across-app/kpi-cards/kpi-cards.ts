import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../../auth/supabase';
import { PainEntry } from '../../app-pages/new-entry/new-entry';

export interface EntriesStats {
  avgIntensity: number | null;
  avgIntPerMonth: number | null;
  entriesPerMonth: number;
}

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-cards.html',
  styleUrl: './kpi-cards.css',
})
export class KpiCards implements OnInit {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  entries: PainEntry[] = [];

  stats: EntriesStats = {
    avgIntensity: null,
    avgIntPerMonth: null,
    entriesPerMonth: 0,
  };

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    try {
      await this.loadEntries();
      this.stats.avgIntensity = this.calcAvgIntensity();
      this.stats.entriesPerMonth = this.calcTotalEntries();
      this.stats.avgIntPerMonth = this.calcAvgIntensityPerMonth();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private async getAuthHeaders(): Promise<HttpHeaders | null> {
    const { data: userData, error: userError } = await this.supabase.getUser();
    if (userError || !userData.user) return null;

    const sessionResult = await this.supabase.getSession();
    const accessToken = sessionResult.data.session?.access_token;
    if (!accessToken) return null;

    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  }

  private async loadEntries(): Promise<void> {
    const headers = await this.getAuthHeaders();
    if (!headers) {
      this.entries = [];
      return;
    }

    this.entries = await firstValueFrom(
      this.http.get<PainEntry[]>('http://localhost:3000/api/pain-entries', { headers })
    );
  }

  calcTotalEntries(): number {
    return this.entries.length;
  }

  calcAvgIntensity(): number | null {
    const validEntries = this.entries.filter(
      entry => entry.painIntensity !== null && entry.painIntensity !== undefined
    );

    if (!validEntries.length) return null;

    const sum = validEntries.reduce((acc, entry) => acc + entry.painIntensity, 0);
    return Number((sum / validEntries.length).toFixed(1));
  }

  calcAvgIntensityPerMonth(): number | null {
    const now = new Date();

    const monthEntries = this.entries.filter(entry => {
      if (!entry.created_at) return false;
      const date = new Date(entry.created_at);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    if (!monthEntries.length) return null;

    const sum = monthEntries.reduce((acc, entry) => acc + (entry.painIntensity ?? 0), 0);
    return Number((sum / monthEntries.length).toFixed(1));
  }

  getIntensityClass(value: number | null): string {
    if (value === null) return 'kpi-neutral';
    if (value === 0) return 'pain-zero';
    if (value <= 3) return 'pain-low';
    if (value <= 6) return 'pain-medium';
    return 'pain-high';
  }

  getMonthIntensityClass(value: number | null): string {
    if (value === null) return 'kpi-neutral';
    if (value === 0) return 'pain-zero';
    if (value <= 3) return 'pain-low';
    if (value <= 6) return 'pain-medium';
    return 'pain-high';
  }
}