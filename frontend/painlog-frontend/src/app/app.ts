import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared-across-app/header/header/header';
import { Footer } from './shared-across-app/footer/footer/footer';
import { NavMenu } from './shared-across-app/nav-menu/nav-menu/nav-menu';
import { AuthState } from './auth/auth-state/auth-state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, NavMenu],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authState = inject(AuthState);
}