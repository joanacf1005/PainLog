import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  medicationText?: string;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  searchTerm = '';
  filtersOpen = false;

  currentPage = 1;
  itemsPerPage = 6;

  get totalPages(): number {
    return Math.ceil(this.filteredPainEntries.length / this.itemsPerPage) || 1;
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

      this.allEntries = painEntries.map(entry => {
        const relation = medicationEntries.find(
          r => String(r.painEntriesId) === String(entry.id)
        );

        const medication = relation
          ? medications.find(m => String(m.id) === String(relation.medicationId))
          : undefined;


        const medicationName = medication?.name ?? null;
        const medicationDosage = medication?.dosage ?? null;

        let medicationText = 'No medication taken.';

        if (entry.hasTakenMedication) {
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

        return {
          ...entry,
          medicationName,
          medicationDosage,
          medicationText,
        };
      });

      this.applyFilters();
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

  applyFilters(): void {
    let entries = [...this.allEntries];
    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      entries = entries.filter(entry =>
        entry.painLocation?.toLowerCase().includes(term) ||
        entry.painType?.toLowerCase().includes(term) ||
        String(entry.painIntensity).includes(term) ||
        entry.medicationName?.toLowerCase().includes(term)
      );
    }

    switch (this.currentFilter) {
      case PainEntryFilter.PAININTENSITY:
        entries.sort((a, b) => b.painIntensity - a.painIntensity);
        break;
      // case PainEntryFilter.PAINTYPE:
      //   entries.sort((a, b) => a.painType.localeCompare(b.painType));
      //   break;
      case PainEntryFilter.PAINLOCATION:
        entries.sort((a, b) => a.painLocation.localeCompare(b.painLocation));
        break;
      case PainEntryFilter.HASMEDICATION:
        entries = entries.filter(entry => entry.hasTakenMedication === true);
        break;
      case PainEntryFilter.ALL:
      default:
        break;
    }

    this.filteredPainEntries = entries;
    this.currentPage = 1;
  }

  setFilter(filter: string): void {
    this.currentFilter = filter as PainEntryFilter;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getIntensityClass(intensity: number): string {
    if (intensity === 0) return 'pain-zero';
    if (intensity <= 3) return 'pain-low';
    if (intensity <= 6) return 'pain-medium';
    return 'pain-high';
  }
}