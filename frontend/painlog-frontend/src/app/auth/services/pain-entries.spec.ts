import { TestBed } from '@angular/core/testing';

import { PainEntriesService } from './pain-entries';

describe('PainEntries', () => {
  let service: PainEntriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PainEntriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
