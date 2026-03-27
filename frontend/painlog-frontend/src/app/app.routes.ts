import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { LoginComponent } from './auth/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: '**', redirectTo: 'login' }
];