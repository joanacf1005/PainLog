import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthState } from './auth-state';

describe('AuthState', () => {
  let component: AuthState;
  let fixture: ComponentFixture<AuthState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthState],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthState);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
