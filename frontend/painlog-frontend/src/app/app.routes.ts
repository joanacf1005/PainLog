import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { NewEntry } from './app-pages/new-entry/new-entry';
import { HomePage } from './app-pages/home-page/home-page/home-page';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'homepage', component: HomePage },
  { path: 'newentry', component: NewEntry},
  { path: 'edit-entry/:id', component: NewEntry },
  { path: '**', redirectTo: 'login' }
];


//, canActivate: [authGuard]  depois meter isto nas rotas