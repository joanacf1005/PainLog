import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { NewEntry } from './app-pages/new-entry/new-entry';
import { HomePage } from './app-pages/home-page/home-page/home-page';
import { ReportsPage } from './app-pages/reports-page/reports-page';
import { DetailsPage } from './app-pages/details-page/details-page';
import { StatisticsPage } from './app-pages/statistics-page/statistics-page';
import { authGuard } from './auth/guard/guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'homepage', component: HomePage, canActivate: [authGuard] },
  { path: 'newentry', component: NewEntry, canActivate: [authGuard]},
  { path: 'edit-entry/:id', component: NewEntry, canActivate: [authGuard] },
  { path: 'reportspage', component: ReportsPage, canActivate: [authGuard]},
  { path: 'details-page/:id', component: DetailsPage, canActivate: [authGuard]},
  { path: 'statistics', component: StatisticsPage, canActivate: [authGuard]},
  { path: '**', redirectTo: 'login' }
];


//, canActivate: [authGuard]  depois meter isto nas rotas