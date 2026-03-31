import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../../auth/supabase';
import { PainEntry, Medication, MedicationEntry } from '../new-entry/new-entry';

enum PainEntryFilter {
  ALL = 'all',
  PAININTENSITY = 'painIntensity',
  PAINTYPE = 'painType',
  PAINLOCATION = 'painLocation',
  HASMEDICATION = 'hasMedication',
}

export interface ReportPainEntry extends PainEntry {
  medicationName?: string | null;
  medicationDosage?: string | null;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css',
})
export class ReportsPage implements OnInit {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);

  allEntries: ReportPainEntry[] = [];
  filteredPainEntries: ReportPainEntry[] = [];
  loading = false;
  errorMessage = '';
  currentFilter: PainEntryFilter = PainEntryFilter.ALL;

  currentPage = 1;
  itemsPerPage = 6;
  filtersOpen = false;

  get totalPages(): number {
    return Math.ceil(this.filteredPainEntries.length / this.itemsPerPage);
  }

  get currentPainEntries(): ReportPainEntry[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPainEntries.slice(start, end);
  }

  async ngOnInit(): Promise<void> {
    await this.loadPainEntries();
  }

  private async getAuthHeaders(): Promise<HttpHeaders | null> {
    const { data: userData, error: userError } = await this.supabase.getUser();

    if (userError || !userData.user) {
      this.errorMessage = 'User not authenticated';
      return null;
    }

    const sessionResult = await this.supabase.getSession();
    const accessToken = sessionResult.data.session?.access_token;
    console.log('ACCESS TOKEN:', accessToken);

    if (!accessToken) {
      this.errorMessage = 'No session found';
      return null;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  }

  private async loadPainEntries(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const headers = await this.getAuthHeaders();
      if (!headers) return;

      const [painEntries, medicationEntries, medications] = await Promise.all([
        firstValueFrom(this.http.get<PainEntry[]>('http://localhost:3000/api/pain-entries', { headers })),
        firstValueFrom(this.http.get<MedicationEntry[]>('http://localhost:3000/api/medication-entries', { headers })),
        firstValueFrom(this.http.get<Medication[]>('http://localhost:3000/api/medication', { headers })),
      ]);

      const medicationMap = new Map<string, Medication>(
        medications.map(med => [med.id, med])
      );

      const medicationByPainEntryId = new Map<string, Medication>();

      for (const relation of medicationEntries) {
        const medication = medicationMap.get(relation.medicationId);
        if (medication) {
          medicationByPainEntryId.set(relation.painEntriesId, medication);
        }
      }

      this.allEntries = painEntries.map(entry => {
        const medication = medicationByPainEntryId.get(entry.id);

        return {
          ...entry,
          medicationName: medication?.name ?? null,
          medicationDosage: medication?.dosage ?? null,
        };
      });

      this.filteredPainEntries = [...this.allEntries];
      this.currentPage = 1;
    } catch (error: any) {
      this.errorMessage =
        error?.error?.error ||
        error?.error?.message ||
        error?.message ||
        'Error loading pain entries';
    } finally {
      this.loading = false;
    }
  }

  filterPainEntries(filter: string): void {
    this.currentFilter = filter as PainEntryFilter;
    this.currentPage = 1;

    switch (filter) {
      case 'all':
        this.filteredPainEntries = [...this.allEntries];
        break;
      case 'painIntensity':
        this.filteredPainEntries = [...this.allEntries].sort(
          (a, b) => b.painIntensity - a.painIntensity
        );
        break;
      case 'painType':
        this.filteredPainEntries = [...this.allEntries].sort((a, b) =>
          a.painType.localeCompare(b.painType)
        );
        break;
      case 'painLocation':
        this.filteredPainEntries = [...this.allEntries].sort((a, b) =>
          a.painLocation.localeCompare(b.painLocation)
        );
        break;
      case 'hasMedication':
        this.filteredPainEntries = this.allEntries.filter(
          entry => entry.hasTakenMedication === true
        );
        break;
      default:
        this.filteredPainEntries = [...this.allEntries];
        break;
    }
  }

  setFilter(filter: string): void {
    this.filterPainEntries(filter);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}