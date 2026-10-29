import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ejercicios } from './ejercicios';

describe('Ejercicios', () => {
  let component: Ejercicios;
  let fixture: ComponentFixture<Ejercicios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ejercicios],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ejercicios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
