import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoginService, LoginData, Usuario } from './login';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;

  const mockUsuarios: Usuario[] = [
    { id: 1, email: 'test@test.com', nombre: 'Test User', password: '123' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LoginService
      ]
    });
    
    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully with valid credentials', () => {
    const loginData: LoginData = {
      email: 'test@test.com',
      password: '123'
    };

    service.login(loginData).subscribe(usuario => {
      expect(usuario).not.toBeNull();
      expect(usuario?.email).toBe('test@test.com');
      expect(usuario?.nombre).toBe('Test User');
    });

    const req = httpMock.expectOne('http://localhost:3000/usuarios?email=test@test.com');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsuarios);
  });

  it('should return null for invalid credentials', () => {
    const loginData: LoginData = {
      email: 'test@test.com',
      password: 'wrong'
    };

    service.login(loginData).subscribe(usuario => {
      expect(usuario).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:3000/usuarios?email=test@test.com');
    req.flush(mockUsuarios);
  });

  it('should return null for non-existent user', () => {
    const loginData: LoginData = {
      email: 'noexiste@test.com',
      password: '123'
    };

    service.login(loginData).subscribe(usuario => {
      expect(usuario).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:3000/usuarios?email=noexiste@test.com');
    req.flush([]);
  });

  it('should get all users', () => {
    service.getUsuarios().subscribe(usuarios => {
      expect(usuarios.length).toBe(1);
      expect(usuarios[0].email).toBe('test@test.com');
    });

    const req = httpMock.expectOne('http://localhost:3000/usuarios');
    req.flush(mockUsuarios);
  });
});
