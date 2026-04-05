import { AuthState } from './auth-state';

describe('AuthState', () => {
  it('should be created', () => {
    expect(new AuthState()).toBeTruthy();
  });

  it('should initialize with correct default state', () => {
    const authState = new AuthState();
    expect(authState.isLoggedIn()).toBe(false);
  });
});