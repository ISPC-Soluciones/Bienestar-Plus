import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RecursosComponent } from './recursos';
import { RecursosService } from '../../services/recursos.service';
import { Recurso } from '../../models/recurso.model';

describe('RecursosComponent', () => {
  let component: RecursosComponent;
  let fixture: ComponentFixture<RecursosComponent>;
  let recursosServiceSpy: jasmine.SpyObj<RecursosService>;

  const mockRecursos: Recurso[] = [
    {
      id: 1,
      descripcion: 'Técnica de respiración 4-7-8 para reducir la ansiedad.',
      tipo: 'Bienestar Psicológico',
      enlace: 'https://ejemplo.com/respiracion'
    },
    {
      id: 2,
      descripcion: 'Ejercicio de grounding 5-4-3-2-1 sin enlace externo.',
      tipo: 'Material de Apoyo',
      enlace: ''
    }
  ];

  beforeEach(async () => {
    recursosServiceSpy = jasmine.createSpyObj<RecursosService>('RecursosService', ['getRecursos']);
    recursosServiceSpy.getRecursos.and.returnValue(of(mockRecursos));

    await TestBed.configureTestingModule({
      imports: [RecursosComponent],
      providers: [{ provide: RecursosService, useValue: recursosServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(RecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar los recursos devueltos por el backend', () => {
    expect(component.cargando).toBeFalse();
    expect(component.recursos.length).toBe(2);

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.recurso-card');
    expect(cards.length).toBe(2);

    const firstCard = cards[0];
    expect(firstCard.textContent).toContain('Bienestar Psicológico');
    expect(firstCard.textContent).toContain('Técnica de respiración 4-7-8');
  });

  it('debe mostrar el enlace funcional cuando exista y ocultarlo cuando esté vacío', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.recurso-card');

    // Primera tarjeta: tiene enlace
    const enlace = cards[0].querySelector('a.btn-recurso-enlace') as HTMLAnchorElement;
    expect(enlace).toBeTruthy();
    expect(enlace.href).toBe('https://ejemplo.com/respiracion');
    expect(enlace.target).toBe('_blank');

    // Segunda tarjeta: NO tiene enlace
    const sinEnlace = cards[1].querySelector('a.btn-recurso-enlace');
    expect(sinEnlace).toBeNull();
    const infoSinEnlace = cards[1].querySelector('.sin-enlace-info');
    expect(infoSinEnlace).toBeTruthy();
  });

  it('debe mostrar el estado vacío cuando la lista de recursos está vacía', () => {
    recursosServiceSpy.getRecursos.and.returnValue(of([]));
    component.cargarRecursos();
    fixture.detectChanges();

    expect(component.recursosFiltrados.length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    const estadoVacio = compiled.querySelector('#estado-vacio');
    expect(estadoVacio).toBeTruthy();
    expect(estadoVacio?.textContent).toContain('No se encontraron recursos');
  });

  it('no produce errores ante fallas de red y muestra el estado vacío', () => {
    recursosServiceSpy.getRecursos.and.returnValue(throwError(() => new Error('Error de red')));
    component.cargarRecursos();
    fixture.detectChanges();

    expect(component.cargando).toBeFalse();
    expect(component.recursosFiltrados.length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#estado-vacio')).toBeTruthy();
  });
});
