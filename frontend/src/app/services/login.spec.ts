import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../environments/environment';
import { LoginData, LoginService } from './login';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  const url = `${environment.backendUrl}/api/login/`;
  const datos: LoginData = { email: 'test@test.com', password: 'Clave-2026' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the user when the credentials are valid', () => {
    service.login(datos).subscribe((usuario) => {
      expect(usuario?.id).toBe(1);
      expect(usuario?.email).toBe('test@test.com');
      expect(usuario?.rol).toBe('estandar');
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true, data: { id: 1, nombre: 'Test', email: 'test@test.com', rol: 'estandar' } });
  });

  it('should return null when the backend answers 401', () => {
    service.login(datos).subscribe((usuario) => expect(usuario).toBeNull());

    httpMock.expectOne(url).flush({ error: 'Usuario o contraseña incorrectos' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should propagate server errors (500) instead of hiding them', () => {
    service.login(datos).subscribe({
      next: () => fail('no debería emitir un usuario'),
      error: (err) => expect(err.status).toBe(500),
    });

    httpMock.expectOne(url).flush('error', { status: 500, statusText: 'Server Error' });
  });
});
