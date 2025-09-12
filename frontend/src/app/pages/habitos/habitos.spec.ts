import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Habitos } from './habitos';

describe('Habitos', () => {
  let component: Habitos;
  let fixture: ComponentFixture<Habitos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Habitos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Habitos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
