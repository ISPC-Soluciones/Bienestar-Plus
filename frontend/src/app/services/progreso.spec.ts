import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { ProgresoService } from './progreso';

describe('ProgresoService', () => {
  let service: ProgresoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(ProgresoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
