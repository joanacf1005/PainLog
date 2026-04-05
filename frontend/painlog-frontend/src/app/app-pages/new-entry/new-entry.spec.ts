import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NewEntry } from './new-entry';

describe('DetailsPage', () => {
  let component: NewEntry;
  let fixture: ComponentFixture<NewEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewEntry],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }]
    }).compileComponents();
    
    fixture = TestBed.createComponent(NewEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});