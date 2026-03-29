import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { HomePage } from './app-pages/home-page/home-page/home-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'homepage', component: HomePage },
  { path: '**', redirectTo: 'login' }
];


//, canActivate: [authGuard]  depois meter isto nas rotas