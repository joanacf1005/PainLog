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
export class LoginComponent { 
  private fb = inject(FormBuilder); //cria uma instancia do formbuilder
  private supabase = inject(SupabaseService); // Injeta o supabase
  private router = inject(Router); // Injeta a rota

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

      const { data, error } = await this.supabase.signInWithPassword(email, password);

      if (error) {
        this.errorMessage = error.message;
        return;
      }

      alert('Login successful!');
      await this.router.navigate(['/homepage']);
    } finally {
      this.loading = false;
    }
  }
}
