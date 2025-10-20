import { TestBed } from '@angular/core/testing';

import { Noticias } from './noticias';

describe('Noticias', () => {
  let service: Noticias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Noticias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
