import { Router, provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../services/auth';
import { RegistroServicio } from '../../services/registroServicio';
import { LoginService } from '../../services/login';
import { Registro } from './registro';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;
  let registroService: jasmine.SpyObj<RegistroServicio>;
  let authService: jasmine.SpyObj<AuthService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let router: Router;

  beforeEach(async () => {
    localStorage.removeItem('usuario');
    registroService = jasmine.createSpyObj('RegistroServicio', [
      'registrarUsuario',
    ]);
    authService = jasmine.createSpyObj('AuthService', ['login']);
    loginService = jasmine.createSpyObj('LoginService', ['obtenerSesion', 'login']);
    loginService.obtenerSesion.and.returnValue(of(null));
    loginService.login.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        provideRouter([]),
        { provide: RegistroServicio, useValue: registroService },
        { provide: AuthService, useValue: authService },
        { provide: LoginService, useValue: loginService },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  afterEach(() => localStorage.removeItem('usuario'));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts the new user session and opens their profile after registration', () => {
    const usuario = {
      id: 42,
      nombre: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      rol: 'estandar',
      perfil_salud: { mostrar_modal_imc: false },
    };
    registroService.registrarUsuario.and.returnValue(
      of({ success: true, data: usuario }),
    );
    loginService.login.and.returnValue(
      of({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      }),
    );
    component.registroForm.setValue({
      nombre: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      telefono: '3510000000',
      fecha_nacimiento: '1990-01-01',
      genero: 'femenino',
      password: 'Password123',
      confirmar: 'Password123',
      perfil_salud: { peso: null, altura: null },
    });

    component.EnviarFormulario();

    expect(authService.login).toHaveBeenCalledOnceWith(usuario.id);
    expect(loginService.login).toHaveBeenCalledOnceWith({
      email: usuario.email,
      password: 'Password123',
    });
    expect(JSON.parse(localStorage.getItem('usuario')!)).toEqual({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    });
    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/perfil',
      usuario.id,
    ]);
  });

  it('keeps the new session active while the recommendation modal is open', () => {
    const usuario = {
      id: 42,
      nombre: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      rol: 'estandar',
      perfil_salud: {
        mostrar_modal_imc: true,
        recomendacion_enfoque: 'GENERAL',
      },
    };
    registroService.registrarUsuario.and.returnValue(
      of({ success: true, data: usuario }),
    );
    loginService.obtenerSesion.and.returnValue(
      of({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      }),
    );
    component.registroForm.setValue({
      nombre: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      telefono: '3510000000',
      fecha_nacimiento: '1990-01-01',
      genero: 'femenino',
      password: 'Password123',
      confirmar: 'Password123',
      perfil_salud: { peso: 70, altura: 170 },
    });

    component.EnviarFormulario();

    expect(loginService.login).not.toHaveBeenCalled();
    expect(authService.login).toHaveBeenCalledOnceWith(42);
    expect(component.mostrarModalRecomendacion).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();

    component.cerrarModal();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/perfil', 42]);
  });
});
