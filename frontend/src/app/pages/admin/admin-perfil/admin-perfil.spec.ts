import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPerfil } from './admin-perfil';

describe('AdminPerfil', () => {
  let component: AdminPerfil;
  let fixture: ComponentFixture<AdminPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPerfil],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
