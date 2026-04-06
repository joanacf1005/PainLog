import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../supabase';
import { AuthState } from '../auth-state/auth-state';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private authState = inject(AuthState);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get emailCtrl() {
    return this.form.get('email');
  }

  get passwordCtrl() {
    return this.form.get('password');
  }

  async submit() {
    this.errorMessage = '';
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    try {
      const email = this.emailCtrl?.value ?? '';
      const password = this.passwordCtrl?.value ?? '';

      const { error } = await this.supabase.signInWithPassword(email, password);

      if (error) {
        this.errorMessage = 'Invalid email or password. Please check your credentials.';
        this.form.setErrors({ invalidCredentials: true });
        this.cdr.detectChanges();
        return;
      }

      this.authState.setLoggedIn(true);
      await this.router.navigate(['/homepage']);
    } catch (err: any) {
      this.errorMessage = err?.message ?? 'Login error';
      this.form.setErrors({ loginError: true });
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}