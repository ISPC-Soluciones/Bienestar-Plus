import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { Noticias } from './noticias';
import { NoticiasResponse } from '../models/noticia.model';

describe('Noticias', () => {
  let service: Noticias;
  let httpMock: HttpTestingController;

  const response: NoticiasResponse = {
    articles: [],
    isFallback: false,
    updatedAt: '2026-09-12T10:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(Noticias);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request news from the backend', () => {
    service.getNews().subscribe(data => expect(data).toEqual(response));

    const request = httpMock.expectOne('http://localhost:8000/api/noticias/');
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });
});
