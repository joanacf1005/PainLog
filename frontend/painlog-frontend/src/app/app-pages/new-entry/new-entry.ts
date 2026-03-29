import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SupabaseService } from '../../auth/supabase';

@Component({
  selector: 'app-new-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
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
    energyLevel: ['', [Validators.required]],
    sleepHours: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {}

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

      const payload = {
        ...this.form.getRawValue(),
      };

      const headers = new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
      });

      await firstValueFrom(
        this.http.post('http://localhost:3000/api/pain-entries', payload, { headers })
      );

      await this.router.navigate(['/homepage']);

    } catch (error: any) {
      this.errorMessage = error?.message ?? 'Error saving entry';

    } finally {
      this.loading = false;
    }
  }
}
