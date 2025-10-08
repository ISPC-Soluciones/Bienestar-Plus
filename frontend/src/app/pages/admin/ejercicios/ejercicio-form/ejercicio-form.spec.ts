import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EjercicioForm } from './ejercicio-form';

describe('EjercicioForm', () => {
  let component: EjercicioForm;
  let fixture: ComponentFixture<EjercicioForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EjercicioForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EjercicioForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
