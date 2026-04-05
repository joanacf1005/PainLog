import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './guard';

describe('Guard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [], // Sem imports nem createComponent
    }).compileComponents();
  });

  it('should create', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBeTruthy();
  });
});