import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { RegistroServicio } from './registroServicio';

describe('RegistroServicio', () => {
  let service: RegistroServicio;
  let httpMock: HttpTestingController;
  const url = `${environment.backendUrl}/api/registro/`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RegistroServicio);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends registration with credentials to establish the session cookie', () => {
    service.registrarUsuario({ email: 'nuevo@example.com' }).subscribe();

    const request = httpMock.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    request.flush({ success: true, data: { id: 1 } });
  });
});
