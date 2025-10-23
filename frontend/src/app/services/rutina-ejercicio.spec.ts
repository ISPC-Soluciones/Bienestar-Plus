import { TestBed } from '@angular/core/testing';

import { RutinaEjercicio } from './rutina-ejercicio';

describe('RutinaEjercicio', () => {
  let service: RutinaEjercicio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RutinaEjercicio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
