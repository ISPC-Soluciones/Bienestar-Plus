import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { NewsSection } from './news-section';
import { Noticias } from '../../services/noticias';
import { NoticiasResponse } from '../../models/noticia.model';

describe('NewsSection', () => {
  let component: NewsSection;
  let fixture: ComponentFixture<NewsSection>;
  let newsService: jasmine.SpyObj<Noticias>;

  const response: NoticiasResponse = {
    articles: [{
      id: '1',
      title: 'Hábitos para cuidar la salud mental',
      summary: 'Información útil para tu bienestar.',
      url: 'https://example.org/noticia',
      image: null,
      source: 'OPS',
      publishedAt: '2026-09-12T10:00:00Z',
      category: 'salud-mental'
    }],
    isFallback: false,
    updatedAt: '2026-09-12T10:00:00Z'
  };

  beforeEach(async () => {
    newsService = jasmine.createSpyObj<Noticias>('Noticias', ['getNews']);
    newsService.getNews.and.returnValue(of(response));

    await TestBed.configureTestingModule({
      imports: [NewsSection],
      providers: [{ provide: Noticias, useValue: newsService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display normalized news returned by the backend', () => {
    expect(component.isLoading).toBeFalse();
    expect(component.articles).toEqual(response.articles);
    expect(fixture.nativeElement.querySelector('.news-card__title').textContent).toContain(
      response.articles[0].title
    );
  });

  it('should show an error and allow retrying', () => {
    newsService.getNews.and.returnValue(throwError(() => new Error('Network error')));

    component.loadNews();
    fixture.detectChanges();

    expect(component.errorMessage).toContain('No pudimos cargar');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('should use a local fallback image when an article has no image', () => {
    expect(component.imageFor(response.articles[0])).toBe(
      '/assets/healthy-llifestyle-elements-frame-background-free-vector.jpg'
    );
  });
});
