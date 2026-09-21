import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { PasswordResetService } from './password-reset';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PasswordResetService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('requests a reset email', () => {
    service.requestReset('usuario@example.com').subscribe();

    const request = httpTesting.expectOne(
      `${environment.backendUrl}/api/password-reset/request/`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'usuario@example.com' });
    request.flush({ message: 'Correo enviado' });
  });

  it('confirms a new password with the token', () => {
    service.confirmReset('token', 'Password123', 'Password123').subscribe();

    const request = httpTesting.expectOne(
      `${environment.backendUrl}/api/password-reset/confirm/`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      token: 'token',
      password: 'Password123',
      confirmar_password: 'Password123',
    });
    request.flush({ message: 'Contraseña actualizada' });
  });
});
