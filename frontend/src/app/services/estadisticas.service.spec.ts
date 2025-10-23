import { TestBed } from '@angular/core/testing';

import { EstadisticasService } from './estadisticas.service';

describe('EstadisticasService', () => {
  let service: EstadisticasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadisticasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
