import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../../auth/supabase';

export interface PainEntry {
  id: string;
  painLocation: string;
  painIntensity: number;
  painType: string;
  hasTakenMedication: boolean;
  energyLevel: number;
  sleepHours: number;
  notes: string | null;
  created_at?: string;
  userId?: string;
}

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './details-page.html',
  styleUrl: './details-page.css',
})
export class DetailsPage implements OnInit {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMessage = '';
  entryId: string | null = null;
  entry: PainEntry | null = null;

  showDeleteModal = false;

  async ngOnInit(): Promise<void> {
    this.entryId = this.route.snapshot.paramMap.get('id');

    if (!this.entryId) {
      this.errorMessage = 'Missing entry id';
      this.cdr.detectChanges();
      return;
    }

    await this.loadDetails(this.entryId);
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

  private async loadDetails(id: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      const headers = await this.getAuthHeaders();
      if (!headers) return;

      this.entry = await firstValueFrom(
        this.http.get<PainEntry>(`http://localhost:3000/api/pain-entries/${id}`, { headers })
      );
    } catch (error: any) {
      console.error('Load details error:', error);
      this.errorMessage =
        error?.error?.error ||
        error?.error?.message ||
        error?.message ||
        'Error loading details';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getIntensityClass(value: number): string {
    if (value === 0) return 'pain-zero';
    if (value <= 3) return 'pain-low';
    if (value <= 6) return 'pain-medium';
    return 'pain-high';
  }

  getEnergyClass(value: number): string {
    if (value <= 1) return 'energy-low';
    if (value <= 3) return 'energy-medium';
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

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.cdr.detectChanges();
  }

  async confirmDelete(): Promise<void> {
    if (!this.entryId) return;

    try {
      const headers = await this.getAuthHeaders();
      if (!headers) return;

      await firstValueFrom(
        this.http.delete(`http://localhost:3000/api/pain-entries/${this.entryId}`, { headers })
      );

      this.closeDeleteModal();
      await this.router.navigate(['/homepage']);
    } catch (error: any) {
      console.error('Delete error:', error);
      this.errorMessage =
        error?.error?.error ||
        error?.error?.message ||
        error?.message ||
        'Error deleting entry';
      this.cdr.detectChanges();
    }
  }
}