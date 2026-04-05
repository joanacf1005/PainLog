import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Register } from './register';
import { SupabaseService } from '../supabase';
import { AuthState } from '../auth-state/auth-state';
import { vi } from 'vitest';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let supabaseService: SupabaseService; // ✅ Para spy

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, Register],
      providers: [
        { provide: ActivatedRoute, useValue: {} },        
        { provide: Router, useValue: { navigate: vi.fn() } },
        SupabaseService,
        { provide: AuthState, useValue: { setLoggedIn: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    supabaseService = TestBed.inject(SupabaseService); // ✅ Inject
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call supabase register on valid form submit', async () => {
    vi.spyOn(supabaseService, 'signUp').mockResolvedValue({ error: null } as any);

    component.form.setValue({
      firstName: 'João',
      lastName: 'Silva',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    await component.submit();

    expect(supabaseService.signUp).toHaveBeenCalledWith(
      'test@example.com', 
      'password123', 
      'João', 
      'Silva'
    );
  });
});