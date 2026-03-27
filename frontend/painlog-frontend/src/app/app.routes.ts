import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { Dashboard } from './app-pages/dashboard/dashboard/dashboard';
import { authGuard } from './auth/guard/guard';
import { Header } from './shared-across-app/header/header/header';
import { Footer } from './shared-across-app/footer/footer/footer';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  {path: 'footer', component: Footer},
  {path: 'header', component: Header},
  { path: '**', redirectTo: 'login' }
];
