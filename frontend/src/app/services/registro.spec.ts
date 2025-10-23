import { TestBed } from '@angular/core/testing';

import { RegistroServicio } from './registroServicio';

describe('Registro', () => {
  let service: RegistroServicio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistroServicio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
