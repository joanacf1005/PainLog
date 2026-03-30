import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  loading = false;
  errorMessage = '';

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

  ngOnInit(): void {
    this.form.get('hasTakenMedication')?.valueChanges.subscribe((checked) => {
      const name = this.form.get('name');
      const dosage = this.form.get('dosage');

      if (checked) {
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
    });
  }

  async submit() {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    try {
      const { data: userData, error: userError } = await this.supabase.getUser();
      if (userError || !userData.user) {
        this.errorMessage = 'User not authenticated';
        return;
      }

      const sessionResult = await this.supabase.getSession();
      const accessToken = sessionResult.data.session?.access_token;

      if (!accessToken) {
        this.errorMessage = 'No session found';
        return;
      }

      const raw = this.form.getRawValue();

      const painLocation = String(raw.painLocation ?? '').trim();
      const painType = String(raw.painType ?? '').trim();
      const notes = String(raw.notes ?? '').trim();

      if (
        !painLocation ||
        !painType ||
        raw.painIntensity === '' ||
        raw.energyLevel === '' ||
        raw.sleepHours === ''
      ) {
        this.errorMessage = 'Fill in mandatory fields correctly.';
        return;
      }

      const painIntensity = Number(raw.painIntensity);
      const energyLevel = Number(raw.energyLevel);
      const sleepHours = Number(raw.sleepHours);

      if (
        Number.isNaN(painIntensity) ||
        Number.isNaN(energyLevel) ||
        Number.isNaN(sleepHours)
      ) {
        this.errorMessage = 'Fill in mandatory fields correctly.';
        return;
      }

      const hasTakenMedication = !!raw.hasTakenMedication;

      const headers = new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      });

      if (hasTakenMedication) {
        const name = String(raw.name ?? '').trim();
        const dosage = String(raw.dosage ?? '').trim();

        if (!name || !dosage) {
          this.errorMessage = 'Fill in medication name and dosage.';
          return;
        }

        await firstValueFrom(
          this.http.post('http://localhost:3000/api/medication', { name, dosage }, { headers })
        );
      }

      const painEntryPayload = {
        painLocation,
        painIntensity,
        painType,
        hasTakenMedication,
        energyLevel,
        sleepHours,
        notes,
      };

      console.log('painEntryPayload', painEntryPayload);

      await firstValueFrom(
        this.http.post('http://localhost:3000/api/pain-entries', painEntryPayload, { headers })
      );

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