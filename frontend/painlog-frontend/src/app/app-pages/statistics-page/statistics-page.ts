import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../../auth/supabase';
import { PainEntry, Medication, MedicationEntry } from '../new-entry/new-entry';
import { KpiCards } from '../../shared-across-app/kpi-cards/kpi-cards';
import { Kpis } from './kpis/kpis';

interface PainLocationStat {
  label: string;
  value: number;
  color: string;
  percent: number;
  dashArray: string;
  dashOffset: number;
}

interface PainIntensityBar {
  label: string;
  average: number;
  count: number;
  color: string;
  heightPct: number;
}

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [CommonModule, KpiCards, Kpis],
  templateUrl: './statistics-page.html',
  styleUrl: './statistics-page.css',
})
export class StatisticsPage implements OnInit {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMessage = '';
  totalEntries = 0;

  locationStats: PainLocationStat[] = [];
  intensityBars: PainIntensityBar[] = [];

  hoveredItem: PainLocationStat | null = null;
  tooltipPos = { x: 0, y: 0 };

  hoveredBar: PainIntensityBar | null = null;
  barTooltipPos = { x: 0, y: 0 };

  private readonly colors = [
    '#cfe8f3',
    '#d9f2e6',
    '#f9d9e5',
    '#fbe8c8',
    '#e6ddf7',
    '#f8dccf',
    '#dfe9f5',
    '#e3f0dc',
  ];

  async ngOnInit(): Promise<void> {
    await this.loadStatistics();
  }

  private async getAuthHeaders(): Promise<HttpHeaders | null> {
    const { data: userData, error: userError } = await this.supabase.getUser();

    if (userError || !userData.user) {
      this.errorMessage = 'User not authenticated';
      this.cdr.detectChanges();
      return null;
    }

    const sessionResult = await this.supabase.getSession();
    const accessToken = sessionResult.data.session?.access_token;

    if (!accessToken) {
      this.errorMessage = 'No session found';
      this.cdr.detectChanges();
      return null;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  }

  private async loadStatistics(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      const headers = await this.getAuthHeaders();
      if (!headers) return;

      const [painEntries, medicationEntries, medications] = await Promise.all([
        firstValueFrom(this.http.get<PainEntry[]>('http://localhost:3000/api/pain-entries', { headers })),
        firstValueFrom(this.http.get<MedicationEntry[]>('http://localhost:3000/api/medication-entries', { headers })),
        firstValueFrom(this.http.get<Medication[]>('http://localhost:3000/api/medication', { headers })),
      ]);

      const enrichedEntries = painEntries.map(entry => {
        const relation = medicationEntries.find(
          r => String(r.painEntriesId) === String(entry.id)
        );

        const medication = relation
          ? medications.find(m => String(m.id) === String(relation.medicationId))
          : undefined;

        return {
          ...entry,
          medicationName: medication?.name ?? null,
          medicationDosage: medication?.dosage ?? null,
        };
      });

      const validEntries = enrichedEntries.filter(entry => Number(entry.painIntensity || 0) > 0);

      const counts = new Map<string, number>();
      const intensityMap = new Map<string, { sum: number; count: number }>();

      for (const entry of validEntries) {
        const location = (entry.painLocation || 'Unknown').trim();

        counts.set(location, (counts.get(location) ?? 0) + 1);

        const current = intensityMap.get(location) ?? { sum: 0, count: 0 };
        intensityMap.set(location, {
          sum: current.sum + Number(entry.painIntensity || 0),
          count: current.count + 1,
        });
      }

      const rawStats = Array.from(counts.entries())
  .map(([label, value]) => ({ label, value }))
  .sort((a, b) => b.value - a.value);

this.totalEntries = rawStats.reduce((sum, item) => sum + item.value, 0);

const circumference = 2 * Math.PI * 45;
let offset = 0;

const locationColorMap = new Map<string, string>();

this.locationStats = rawStats.map((item, index) => {
  const ratio = this.totalEntries ? item.value / this.totalEntries : 0;
  const color = this.colors[index % this.colors.length];
  locationColorMap.set(item.label, color);

  const stat: PainLocationStat = {
    label: item.label,
    value: item.value,
    color,
    percent: ratio * 100,
    dashArray: `${ratio * circumference} ${circumference}`,
    dashOffset: -offset,
  };

  offset += ratio * circumference;
  return stat;
});

  const rawBars = Array.from(intensityMap.entries())
    .map(([label, data]) => ({
      label,
      average: data.count ? data.sum / data.count : 0,
      count: data.count,
      color: locationColorMap.get(label) ?? '#dfe9f5',
      heightPct: 0,
    }))
    .sort((a, b) => b.average - a.average);

  const maxAverage = Math.max(...rawBars.map(b => b.average), 10);

  this.intensityBars = rawBars.map(bar => ({
    ...bar,
    heightPct: (bar.average / maxAverage) * 100,
  }));
    } catch (error: any) {
      this.errorMessage =
        error?.error?.error ||
        error?.error?.message ||
        error?.message ||
        'Error loading statistics';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  showTooltip(item: PainLocationStat, event: MouseEvent): void {
    this.hoveredItem = item;
    const target = event.currentTarget as SVGElement | null;
    const host = target?.ownerSVGElement?.parentElement as HTMLElement | null;
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    this.tooltipPos = {
      x: event.clientX - hostRect.left,
      y: event.clientY - hostRect.top,
    };
  }

  moveTooltip(event: MouseEvent): void {
    if (!this.hoveredItem) return;
    const target = event.currentTarget as SVGElement | null;
    const host = target?.ownerSVGElement?.parentElement as HTMLElement | null;
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    this.tooltipPos = {
      x: event.clientX - hostRect.left,
      y: event.clientY - hostRect.top,
    };
  }

  hideTooltip(): void {
    this.hoveredItem = null;
  }

  showBarTooltip(item: PainIntensityBar, event: MouseEvent): void {
    this.hoveredBar = item;
    const target = event.currentTarget as HTMLElement | null;
    const host = target?.closest('.chart-card') as HTMLElement | null;
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    this.barTooltipPos = {
      x: event.clientX - hostRect.left,
      y: event.clientY - hostRect.top,
    };
  }

  moveBarTooltip(event: MouseEvent): void {
    if (!this.hoveredBar) return;
    const target = event.currentTarget as HTMLElement | null;
    const host = target?.closest('.chart-card') as HTMLElement | null;
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    this.barTooltipPos = {
      x: event.clientX - hostRect.left,
      y: event.clientY - hostRect.top,
    };
  }

  hideBarTooltip(): void {
    this.hoveredBar = null;
  }
}