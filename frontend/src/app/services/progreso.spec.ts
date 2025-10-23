import { TestBed } from '@angular/core/testing';

import { Progreso } from './progreso';

describe('Progreso', () => {
  let service: Progreso;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Progreso);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
