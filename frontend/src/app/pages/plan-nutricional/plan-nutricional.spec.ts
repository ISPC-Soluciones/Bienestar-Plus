import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { PlanNutricional } from '../../models/plan-nutricional';
import { PlanNutricionalService } from '../../services/plan-nutricional';
import { PlanNutricionalComponent } from './plan-nutricional';

describe('PlanNutricionalComponent', () => {
  let fixture: ComponentFixture<PlanNutricionalComponent>;
  let component: PlanNutricionalComponent;
  let servicio: jasmine.SpyObj<PlanNutricionalService>;
  const plan: PlanNutricional = {
    id: 1, nombre: 'Mi plan', objetivo: 'Organizar', notas: '', creado: '', actualizado: '',
    comidas: [{ tipo: 'desayuno', descripcion: 'Fruta', horario: '08:30:00' }],
  };

  beforeEach(async () => {
    servicio = jasmine.createSpyObj('PlanNutricionalService', ['consultar', 'crear', 'editar']);
    servicio.consultar.and.returnValue(of(null));
    servicio.crear.and.returnValue(of(plan));
    servicio.editar.and.returnValue(of({ ...plan, nombre: 'Editado' }));
    await TestBed.configureTestingModule({ imports: [PlanNutricionalComponent], providers: [provideRouter([]), { provide: PlanNutricionalService, useValue: servicio }] }).compileComponents();
    fixture = TestBed.createComponent(PlanNutricionalComponent);
    component = fixture.componentInstance;
  });

  function completar(): void {
    component.iniciarEdicion();
    component.form.controls.nombre.setValue(' Mi plan ');
    component.form.controls.objetivo.setValue(' Organizar ');
    component.comidas.at(0).controls.descripcion.setValue(' Fruta ');
  }

  it('renders loading followed by an empty state', () => {
    const consulta = new Subject<PlanNutricional | null>();
    servicio.consultar.and.returnValue(consulta);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando tu plan');
    consulta.next(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Todavía no creaste');
    expect(fixture.nativeElement.textContent).toContain('Crear plan');
  });

  it('validates blank inputs without sending a request', () => {
    fixture.detectChanges();
    component.iniciarEdicion();
    component.form.controls.nombre.setValue('   ');
    component.guardar();
    fixture.detectChanges();
    expect(servicio.crear).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Ingresá un nombre');
    expect(fixture.nativeElement.textContent).toContain('Describí la comida');
  });

  it('creates a trimmed plan and displays the persisted result', () => {
    fixture.detectChanges();
    completar();
    component.guardar();
    fixture.detectChanges();
    expect(servicio.crear).toHaveBeenCalledWith({ nombre: 'Mi plan', objetivo: 'Organizar', notas: '', comidas: [{ tipo: 'desayuno', descripcion: 'Fruta', horario: null }] });
    expect(component.editando).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Tu plan quedó guardado');
    expect(fixture.nativeElement.textContent).toContain('08:30');
  });

  it('edits an existing plan and restores server values when cancelling', () => {
    servicio.consultar.and.returnValue(of(plan));
    fixture.detectChanges();
    component.iniciarEdicion();
    expect(component.comidas.at(0).controls.horario.value).toBe('08:30');
    component.form.controls.nombre.setValue('Sin guardar');
    component.cancelar();
    component.iniciarEdicion();
    expect(component.form.controls.nombre.value).toBe('Mi plan');
    component.form.controls.nombre.setValue('Editado');
    component.guardar();
    expect(servicio.editar).toHaveBeenCalled();
    expect(servicio.crear).not.toHaveBeenCalled();
    expect(component.plan?.nombre).toBe('Editado');
  });

  it('prevents duplicate submissions and re-enables editing on failure', () => {
    const escritura = new Subject<PlanNutricional>();
    servicio.crear.and.returnValue(escritura);
    fixture.detectChanges();
    completar();
    component.guardar();
    component.guardar();
    expect(servicio.crear).toHaveBeenCalledTimes(1);
    expect(component.form.disabled).toBeTrue();
    escritura.error(new HttpErrorResponse({ status: 500 }));
    fixture.detectChanges();
    expect(component.form.enabled).toBeTrue();
    expect(component.editando).toBeTrue();
    expect(component.form.controls.nombre.value).toBe(' Mi plan ');
    expect(fixture.nativeElement.textContent).toContain('Tus cambios siguen');
  });

  it('shows nested backend validation errors', () => {
    servicio.crear.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { comidas: [{ horario: ['Horario inválido.'] }] } })));
    fixture.detectChanges();
    completar();
    component.guardar();
    expect(component.error).toContain('Horario inválido.');
  });

  it('supports retry after a load failure without treating it as an empty plan', () => {
    servicio.consultar.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No pudimos cargar');
    expect(fixture.nativeElement.textContent).not.toContain('Todavía no creaste');
    servicio.consultar.and.returnValue(of(plan));
    component.cargar();
    expect(component.plan).toEqual(plan);
    expect(component.error).toBe('');
  });

  it('shows login instead of a form when the session expired', () => {
    servicio.consultar.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/login');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('limits meal count and validates lengths and time', () => {
    fixture.detectChanges();
    completar();
    component.quitarComida(0);
    expect(component.comidas.length).toBe(1);
    for (let i = 0; i < 25; i++) component.agregarComida();
    expect(component.comidas.length).toBe(20);
    component.form.controls.nombre.setValue('x'.repeat(101));
    component.form.controls.objetivo.setValue('x'.repeat(301));
    component.form.controls.notas.setValue('x'.repeat(2001));
    component.comidas.at(0).controls.horario.setValue('25:00');
    component.comidas.at(0).controls.descripcion.setValue('x'.repeat(501));
    expect(component.form.invalid).toBeTrue();
  });

  it('shows a summary with a link to the food tab and no editing form', () => {
    servicio.consultar.and.returnValue(of(plan));
    fixture.componentRef.setInput('resumen', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/habitos?tab=alimentacion');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Fruta');
  });
});
