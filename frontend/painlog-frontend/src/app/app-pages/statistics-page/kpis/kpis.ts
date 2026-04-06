import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../../../auth/supabase';
import { PainEntry } from '../../new-entry/new-entry';

export interface EntriesStats {
  avgEnergy: number | null;
  avgSleep: number | null;
  medicationPercentage: number;
}

@Component({
  selector: 'app-kpis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpis.html',
  styleUrl: './kpis.css',
})
export class Kpis implements OnInit {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  entries: PainEntry[] = [];

  stats: EntriesStats = {
    avgEnergy: null,
    avgSleep: null,
    medicationPercentage: 0,
  };

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    try {
      await this.loadEntries();
      this.stats.avgEnergy = this.calcAvgEnergy();
      this.stats.avgSleep = this.calcAvgSleep();
      this.stats.medicationPercentage = this.calcMedicationPercentage();
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

  calcAvgEnergy(): number | null {
    const validEntries = this.entries.filter(
      entry => entry.energyLevel !== null && entry.energyLevel !== undefined
    );

    if (!validEntries.length) return null;

    const sum = validEntries.reduce((acc, entry) => acc + Number(entry.energyLevel), 0);
    return Number((sum / validEntries.length).toFixed(1));
  }

  calcAvgSleep(): number | null {
    const validEntries = this.entries.filter(
      entry => entry.sleepHours !== null && entry.sleepHours !== undefined
    );

    if (!validEntries.length) return null;

    const sum = validEntries.reduce((acc, entry) => acc + Number(entry.sleepHours), 0);
    return Number((sum / validEntries.length).toFixed(1));
  }

  calcMedicationPercentage(): number {
    if (!this.entries.length) return 0;

    const taken = this.entries.filter(entry => entry.hasTakenMedication === true).length;
    const total = this.entries.filter(
      entry => entry.hasTakenMedication !== null && entry.hasTakenMedication !== undefined
    ).length;

    if (!total) return 0;

    return Number(((taken / total) * 100).toFixed(1));
  }

  getSleepClass(value?: number | null): string {
    const safeValue = value ?? 0;

    if (safeValue < 5) return 'sleep-low';
    if (safeValue >= 5 && safeValue <= 6) return 'sleep-medium-low';
    if (safeValue > 6 && safeValue <= 7) return 'sleep-medium';
    if (safeValue > 7 && safeValue <= 9) return 'sleep-good';
    if (safeValue > 9 && safeValue <= 10) return 'sleep-medium';
    return 'sleep-medium-low';
  }

  getEnergyClass(value: number | null): string {
    const safeValue = value ?? 0;

    if (safeValue <= 1) return 'energy-low';
    if (safeValue <= 3) return 'energy-medium-low';
    if (safeValue <= 4) return 'energy-medium';
    return 'energy-high';
  }

  getMedicationClass(value: number): string {
    if (value <= 0) return 'kpi-zero';
    if (value <= 33) return 'kpi-low';
    if (value <= 66) return 'kpi-medium';
    return 'kpi-high';
  }
}