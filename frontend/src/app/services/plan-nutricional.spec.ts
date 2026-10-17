import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { PlanNutricionalDatos } from '../models/plan-nutricional';
import { PlanNutricionalService } from './plan-nutricional';

describe('PlanNutricionalService', () => {
  let servicio: PlanNutricionalService;
  let http: HttpTestingController;
  const url = `${environment.backendUrl.replace(/\/$/, '')}/api/plan-nutricional/`;
  const datos: PlanNutricionalDatos = { nombre: 'Plan', objetivo: 'Organizar', notas: '', comidas: [{ tipo: 'cena', descripcion: 'Verduras', horario: null }] };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(PlanNutricionalService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('consults the plan with session credentials and supports the empty state', () => {
    servicio.consultar().subscribe((plan) => expect(plan).toBeNull());
    const request = http.expectOne(url);
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.method).toBe('GET');
    request.flush({ plan: null, csrf_token: 'token' });
  });

  for (const metodo of ['POST', 'PATCH'] as const) {
    it(`obtains a fresh CSRF token before ${metodo} and returns the saved plan`, () => {
      const plan = { ...datos, id: 1, creado: '', actualizado: '' };
      (metodo === 'POST' ? servicio.crear(datos) : servicio.editar(datos)).subscribe((result) => expect(result).toEqual(plan));
      http.expectNone((request) => request.method === metodo);
      http.expectOne(url).flush({ plan: null, csrf_token: 'fresh-token' });
      const request = http.expectOne(url);
      expect(request.request.method).toBe(metodo);
      expect(request.request.withCredentials).toBeTrue();
      expect(request.request.headers.get('X-CSRFToken')).toBe('fresh-token');
      expect(request.request.body).toEqual(datos);
      request.flush({ plan });
    });
  }

  it('preserves validation errors for the interface', () => {
    servicio.crear(datos).subscribe({ next: () => fail('Expected validation error'), error: (error) => expect(error.error.nombre).toEqual(['Inválido']) });
    http.expectOne(url).flush({ plan: null, csrf_token: 'token' });
    http.expectOne(url).flush({ nombre: ['Inválido'] }, { status: 400, statusText: 'Bad Request' });
  });

  it('does not write when the session expired during token retrieval', () => {
    servicio.editar(datos).subscribe({ next: () => fail('Expected expired session'), error: (error) => expect(error.status).toBe(401) });
    http.expectOne(url).flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectNone((request) => request.method === 'PATCH');
  });
});
