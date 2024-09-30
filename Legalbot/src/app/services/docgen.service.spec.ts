import { TestBed } from '@angular/core/testing';

import { DocgenService } from './docgen.service';

describe('DocgenService', () => {
  let service: DocgenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocgenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
