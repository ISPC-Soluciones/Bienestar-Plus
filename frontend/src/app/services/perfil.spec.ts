import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { PerfilService } from './perfil';

describe('PerfilService', () => {
  let service: PerfilService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(PerfilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
