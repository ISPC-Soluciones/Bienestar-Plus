import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBienvenida } from './modal-bienvenida';

describe('ModalBienvenida', () => {
  let component: ModalBienvenida;
  let fixture: ComponentFixture<ModalBienvenida>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBienvenida]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalBienvenida);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
