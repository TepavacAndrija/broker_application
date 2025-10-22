import { TestBed } from '@angular/core/testing';

import { AccountStatusService } from './account-status.service';

describe('AccountStatusService', () => {
  let service: AccountStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
