import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from 'express';
import { Header } from './shared-across-app/header/header/header';
import { Footer } from './shared-across-app/footer/footer/footer';
import { NavMenu } from './shared-across-app/nav-menu/nav-menu/nav-menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, NavMenu],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('painlog-frontend');
}
