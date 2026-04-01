import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class AuthState {
  isLoggedIn = signal<boolean>(false);

  setLoggedIn(value: boolean): void {
    this.isLoggedIn.set(value);
  }
}