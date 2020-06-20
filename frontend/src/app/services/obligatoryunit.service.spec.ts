import { TestBed } from '@angular/core/testing';

import { ObligatoryunitService } from './obligatoryunit.service';

describe('ObligatoryunitService', () => {
  let service: ObligatoryunitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObligatoryunitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
