import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { RutinaEjercicioService } from './rutina-ejercicio';

describe('RutinaEjercicioService', () => {
  let service: RutinaEjercicioService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(RutinaEjercicioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
