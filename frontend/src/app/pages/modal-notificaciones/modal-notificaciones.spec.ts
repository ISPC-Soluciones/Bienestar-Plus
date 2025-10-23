import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotificaciones } from './modal-notificaciones';

describe('ModalNotificaciones', () => {
  let component: ModalNotificaciones;
  let fixture: ComponentFixture<ModalNotificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNotificaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNotificaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
