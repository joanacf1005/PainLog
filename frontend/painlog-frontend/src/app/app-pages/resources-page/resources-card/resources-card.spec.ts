import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesCard } from './resources-card';

describe('ResourcesCard', () => {
  let component: ResourcesCard;
  let fixture: ComponentFixture<ResourcesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcesCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcesCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
