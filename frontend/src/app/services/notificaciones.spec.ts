import { TestBed } from '@angular/core/testing';

import { Notificaciones } from './notificaciones';

describe('Notificaciones', () => {
  let service: Notificaciones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Notificaciones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
