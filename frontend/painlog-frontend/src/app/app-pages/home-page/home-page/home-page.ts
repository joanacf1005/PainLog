import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../../../auth/supabase';
import { EntriesStats, KpiCards } from '../../../shared-across-app/kpi-cards/kpi-cards';
import { PainEntry, Medication, MedicationEntry } from '../../new-entry/new-entry';

type DailyEntryView = Omit<PainEntry, 'energyLevel' | 'sleepHours'> & {
  energyLevel?: number | null;
  sleepHours?: number | null;
  medicationName?: string | null;
  medicationDosage?: string | null;
  medicationText?: string;
};

type HomeResourceCard = {
  category: 'Pain' | 'Help' | 'Recipe' | 'Video' | 'Article';
  title: string;
  description: string;
  link: string;
  image: string;
  buttonText: string;
};

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

  homeCards: HomeResourceCard[] = [
    {
      category: 'Recipe',
      title: 'Anti-inflammatory shot',
      description: 'A quick ginger, lemon and turmeric shot with anti-inflammatory properties.',
      link: 'https://www.bbcgoodfood.com/recipes/ginger-shots',
      image: 'assets/resources/shot.jpg',
      buttonText: 'View recipe',
    },
    {
      category: 'Article',
      title: 'Mindfulness to cope with chronic pain',
      description: 'Practical guidance on using mindfulness to manage chronic pain.',
      link: 'https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/use-mindfulness-to-cope-with-chronic-pain',
      image: 'assets/resources/article1.jpg',
      buttonText: 'Read article',
    },
    {
      category: 'Video',
      title: '5-minute breathing reset',
      description: 'A short breathing practice to help you slow down and relax.',
      link: 'https://www.youtube.com/watch?v=L9g4XhFup9g',
      image: 'assets/resources/breathing.jpg',
      buttonText: 'Watch video',
    },
  ];

  private http = inject(HttpClient);
  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.loadDailyEntry();
  }

  private async getAuthHeaders(): Promise<HttpHeaders | null> {
    const { data: userData, error: userError } = await this.supabaseService.getUser();
    if (userError || !userData.user) return null;

    const sessionResult = await this.supabaseService.getSession();
    const accessToken = sessionResult.data.session?.access_token;
    if (!accessToken) return null;

    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  }

  private isSameDay(date1: string | Date | null | undefined, date2: Date): boolean {
    if (!date1) return false;

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    return d1.getTime() === d2.getTime();
  }

  private async loadDailyEntry(): Promise<void> {
    this.loading = true;
    this.cdr.markForCheck();

    try {
      const { data, error } = await this.supabaseService.getUser();

      if (error || !data.user) {
        this.dailyEntry = null;
        return;
      }

      const user = data.user;
      const metadata = user.user_metadata as any;

      this.userName = `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim() || 'User';
      this.firstName = this.userName.split(' ')[0] || 'User';

      const headers = await this.getAuthHeaders();
      if (!headers) {
        this.dailyEntry = null;
        return;
      }

      const [painEntries, medicationEntries, medications] = await Promise.all([
        firstValueFrom(this.http.get<PainEntry[]>('http://localhost:3000/api/pain-entries', { headers })),
        firstValueFrom(this.http.get<MedicationEntry[]>('http://localhost:3000/api/medication-entries', { headers })),
        firstValueFrom(this.http.get<Medication[]>('http://localhost:3000/api/medication', { headers })),
      ]);

      const today = new Date();

      const todaysEntry = painEntries
        .filter(entry => String(entry.userId) === String(user.id))
        .filter(entry => this.isSameDay(entry.created_at, today))
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0];

      if (!todaysEntry) {
        this.dailyEntry = null;
        return;
      }

      const relation = medicationEntries.find(
        r => String(r.painEntriesId) === String(todaysEntry.id)
      );

      const medication = relation
        ? medications.find(m => String(m.id) === String(relation.medicationId))
        : undefined;

      const medicationName = medication?.name ?? null;
      const medicationDosage = medication?.dosage ?? null;

      let medicationText = 'No medication taken.';

      if (todaysEntry.hasTakenMedication) {
        if (medicationName && medicationDosage) {
          medicationText = `Medication taken: ${medicationName} ${medicationDosage}.`;
        } else if (medicationName) {
          medicationText = `Medication taken: ${medicationName}.`;
        } else if (medicationDosage) {
          medicationText = `Medication taken: ${medicationDosage}.`;
        } else {
          medicationText = 'Medication was taken, but the linked medication could not be found.';
        }
      }

      this.dailyEntry = {
        ...todaysEntry,
        medicationName,
        medicationDosage,
        medicationText,
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

  getSleepClass(value?: number | null): string {
    const safeValue = value ?? 0;

    if (safeValue < 5) return 'sleep-low';
    if (safeValue >= 5 && safeValue <= 6) return 'sleep-medium-low';
    if (safeValue > 6 && safeValue <= 7) return 'sleep-medium';
    if (safeValue > 7 && safeValue <= 9) return 'sleep-good';
    if (safeValue > 9 && safeValue <= 10) return 'sleep-medium';
    return 'sleep-medium-low';
  }
}