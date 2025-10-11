import { TestBed } from '@angular/core/testing';

import { Ejercicio } from './ejercicio';

describe('Ejercicio', () => {
  let service: Ejercicio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ejercicio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
