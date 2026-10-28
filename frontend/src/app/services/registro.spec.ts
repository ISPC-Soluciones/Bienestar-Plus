import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { RegistroServicio } from './registroServicio';

describe('Registro', () => {
  let service: RegistroServicio;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(RegistroServicio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
