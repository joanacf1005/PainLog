import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../supabase';

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

  loading = false;
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit() {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    try {
      const email = this.form.value.email ?? '';
      const password = this.form.value.password ?? '';

      const { error } = await this.supabase.signInWithPassword(email, password);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      await this.router.navigate(['/homepage']);
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'Erro ao fazer login';
    } finally {
      this.loading = false;
    }
  }
}
