import { TestBed } from '@angular/core/testing';

import { PainEntries } from './pain-entries';

describe('PainEntries', () => {
  let service: PainEntries;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PainEntries);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
