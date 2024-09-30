import { TestBed } from '@angular/core/testing';

import { FetcherService } from './fetcher.service';

describe('FetcherService', () => {
  let service: FetcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
