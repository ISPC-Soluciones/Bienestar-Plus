import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn } from '@angular/router';

import { adminGuardGuard } from './admin-guard';

describe('adminGuardGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
