import { TestBed } from '@angular/core/testing';

import { Habitos } from './habitos';

describe('Habitos', () => {
  let service: Habitos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Habitos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
