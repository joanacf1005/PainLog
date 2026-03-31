import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class AuthState {
  isLoggedIn = signal<boolean>(false);
}