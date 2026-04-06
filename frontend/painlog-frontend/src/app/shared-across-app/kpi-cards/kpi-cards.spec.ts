import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { KpiCards } from './kpi-cards';
import { SupabaseService } from '../../auth/supabase';
import { PainEntry } from '../../app-pages/new-entry/new-entry';

describe('KpiCards', () => {
  let fixture: ComponentFixture<KpiCards>;
  let component: KpiCards;

  const supabaseSpy = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCards],
      providers: [
        provideRouter([]),
        { provide: SupabaseService, useValue: supabaseSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCards);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate stats correctly', () => {
    const mockEntries: PainEntry[] = [
      {
        id: '1',
        painIntensity: 5,
        created_at: '2026-04-01T10:00:00Z',
        painLocation: 'head',
        painType: 'pressure',
        hasTakenMedication: false,
        energyLevel: 3,
        sleepHours: 7,
        notes: '',
        userId: 'test-user',
      },
      {
        id: '2',
        painIntensity: 3,
        created_at: '2026-04-15T14:00:00Z',
        painLocation: 'lower back',
        painType: 'sharp',
        hasTakenMedication: true,
        energyLevel: 3,
        sleepHours: 6,
        notes: 'melhorou',
        userId: 'test-user',
      },
      {
        id: '3',
        painIntensity: 0,
        created_at: '2026-04-20T09:00:00Z',
        painLocation: 'no',
        painType: 'no pain',
        hasTakenMedication: false,
        energyLevel: 4,
        sleepHours: 8,
        notes: '',
        userId: 'test-user',
      },
    ];

    component.entries = mockEntries;
    component.stats.avgIntensity = component.calcAvgIntensity();
    component.stats.entriesPerMonth = component.calcTotalEntries();
    component.stats.avgIntPerMonth = component.calcAvgIntensityPerMonth();

    expect(component.stats.entriesPerMonth).toBe(3);
    expect(component.stats.avgIntensity).toBeCloseTo(2.7, 1);
    expect(component.stats.avgIntPerMonth).toBeCloseTo(2.7, 1);
  });

  it('should handle empty entries gracefully', () => {
    component.entries = [];
    component.stats.avgIntensity = component.calcAvgIntensity();
    component.stats.entriesPerMonth = component.calcTotalEntries();
    component.stats.avgIntPerMonth = component.calcAvgIntensityPerMonth();

    expect(component.stats.avgIntensity).toBeNull();
    expect(component.stats.entriesPerMonth).toBe(0);
    expect(component.stats.avgIntPerMonth).toBeNull();
  });

  it('should return correct intensity classes', () => {
    expect(component.getIntensityClass(2)).toBe('pain-low');
    expect(component.getIntensityClass(5)).toBe('pain-medium');
    expect(component.getIntensityClass(8)).toBe('pain-high');
    expect(component.getIntensityClass(null)).toBe('kpi-neutral');
  });
});
