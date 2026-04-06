import { ComponentFixture, TestBed } from '@angular/core/testing'; 
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Login } from './login';
import { SupabaseService } from '../supabase';
import { AuthState } from '../auth-state/auth-state';
import { vi } from 'vitest'; 

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let supabaseService: SupabaseService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, Login],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: { navigate: vi.fn() } },
        SupabaseService,
        { provide: AuthState, useValue: { setLoggedIn: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    supabaseService = TestBed.inject(SupabaseService);
    fixture.detectChanges();
  });

  it('should call supabase login on valid form submit', async () => {
    vi.spyOn(supabaseService, 'signInWithPassword').mockResolvedValue({ error: null } as any);

    component.form.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    await component.submit();

    expect(supabaseService.signInWithPassword).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});