import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../../auth/supabase';

@Component({
  selector: 'app-new-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './new-entry.html',
  styleUrl: './new-entry.css',
})
export class NewEntry implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';
  isEditMode = false;
  entryId: string | null = null;

  form = this.fb.group({
    painLocation: ['', [Validators.required, Validators.minLength(3)]],
    painIntensity: ['', [Validators.required]],
    painType: ['', [Validators.required]],
    hasTakenMedication: [false],
    name: [''],
    dosage: [''],
    energyLevel: ['', [Validators.required]],
    sleepHours: ['', [Validators.required]],
    notes: [''],
  });

  async ngOnInit(): Promise<void> {
    this.entryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.entryId;

    this.form.get('hasTakenMedication')?.valueChanges.subscribe((checked) => {
      this.applyMedicationValidators(checked);
    });

    if (this.isEditMode && this.entryId) {
      await this.loadEntry(this.entryId);
    }
  }

  private applyMedicationValidators(checked: boolean | null): void {
    const isChecked = checked ?? false;
    const name = this.form.get('name');
    const dosage = this.form.get('dosage');

    if (isChecked) {
      name?.setValidators([Validators.required, Validators.minLength(2)]);
      dosage?.setValidators([Validators.required, Validators.minLength(1)]);
    } else {
      name?.clearValidators();
      dosage?.clearValidators();
      name?.setValue('');
      dosage?.setValue('');
    }

    name?.updateValueAndValidity();
    dosage?.updateValueAndValidity();
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

  private async loadEntry(id: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const headers = await this.getAuthHeaders();
      if (!headers) return;

      const entry = await firstValueFrom(
        this.http.get<any>(`http://localhost:3000/api/pain-entries/${id}`, { headers })
      );

      this.form.patchValue({
        painLocation: entry.painLocation ?? '',
        painIntensity: entry.painIntensity ?? '',
        painType: entry.painType ?? '',
        hasTakenMedication: !!entry.hasTakenMedication,
        name: entry.name ?? '',
        dosage: entry.dosage ?? '',
        energyLevel: entry.energyLevel ?? '',
        sleepHours: entry.sleepHours ?? '',
        notes: entry.notes ?? '',
      });

      this.applyMedicationValidators(!!entry.hasTakenMedication);
    } catch (error: any) {
      console.error('Load error:', error);
      this.errorMessage =
        error?.error?.error ||
        error?.error?.message ||
        error?.message ||
        'Error loading entry';
    } finally {
      this.loading = false;
    }
  }

  async submit(): Promise<void> {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    try {
      const headers = await this.getAuthHeaders();
      if (!headers) return;

      const raw = this.form.getRawValue();

      const painLocation = String(raw.painLocation ?? '').trim();
      const painType = String(raw.painType ?? '').trim();
      const notes = String(raw.notes ?? '').trim();

      const painIntensity = Number(raw.painIntensity);
      const energyLevel = Number(raw.energyLevel);
      const sleepHours = Number(raw.sleepHours);
      const hasTakenMedication = !!raw.hasTakenMedication;

      if (
        !painLocation ||
        !painType ||
        raw.painIntensity === '' ||
        raw.energyLevel === '' ||
        raw.sleepHours === '' ||
        Number.isNaN(painIntensity) ||
        Number.isNaN(energyLevel) ||
        Number.isNaN(sleepHours)
      ) {
        this.errorMessage = 'Fill in mandatory fields correctly.';
        return;
      }

      if (hasTakenMedication) {
        const name = String(raw.name ?? '').trim();
        const dosage = String(raw.dosage ?? '').trim();

        if (!name || !dosage) {
          this.errorMessage = 'Fill in medication name and dosage.';
          return;
        }

        await firstValueFrom(
          this.http.post(
            'http://localhost:3000/api/medication',
            { name, dosage },
            { headers }
          )
        );
      }

      const painEntryPayload = {
        painLocation,
        painIntensity,
        painType,
        hasTakenMedication,
        energyLevel,
        sleepHours,
        notes: notes || null,
      };

      if (this.isEditMode && this.entryId) {
        await firstValueFrom(
          this.http.put(
            `http://localhost:3000/api/pain-entries/${this.entryId}`,
            painEntryPayload,
            { headers }
          )
        );
      } else {
        await firstValueFrom(
          this.http.post(
            'http://localhost:3000/api/pain-entries',
            painEntryPayload,
            { headers }
          )
        );
      }

      await this.router.navigate(['/homepage']);
    } catch (error: any) {
      console.error('Save error:', error);

      if (error?.error?.error) {
        this.errorMessage = error.error.error;
      } else if (error?.error?.message) {
        this.errorMessage = error.error.message;
      } else if (error?.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'Error saving entry';
      }
    } finally {
      this.loading = false;
    }
  }
}