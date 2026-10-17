import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Noticias } from '../../services/noticias';
import { Noticia } from '../../models/noticia.model';

@Component({
  selector: 'app-news-section',
  imports: [CommonModule],
  templateUrl: './news-section.html',
  styleUrl: './news-section.css'
})
export class NewsSection implements OnInit {
  readonly fallbackImages: Record<string, string> = {
    'actividad-fisica': '/assets/hombre_corriendo.jpg',
    nutricion: '/assets/comida_saludable_home.jpg',
    descanso: '/assets/sueno.jpg',
    'salud-mental': '/assets/healthy-llifestyle-elements-frame-background-free-vector.jpg',
    prevencion: '/assets/mujer_bebiendo_agua.jpg',
    bienestar: '/assets/Home-MujerBebiendoAgua.jpg'
  };

  articles: Noticia[] = [];
  isLoading = true;
  isFallback = false;
  errorMessage = '';

  constructor(private noticias: Noticias) {}

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.noticias.getNews().subscribe({
      next: data => {
        this.articles = data.articles;
        this.isFallback = data.isFallback;
        this.isLoading = false;
      },
      error: () => {
        this.articles = [];
        this.isFallback = false;
        this.errorMessage = 'No pudimos cargar las noticias en este momento.';
        this.isLoading = false;
      }
    });
  }

  imageFor(article: Noticia): string {
    return article.image || this.fallbackImages[article.category] || this.fallbackImages['bienestar'];
  }

  useFallbackImage(event: Event, category: string): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = this.fallbackImages[category] || this.fallbackImages['bienestar'];
  }

  categoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'actividad-fisica': 'Actividad física',
      nutricion: 'Nutrición',
      descanso: 'Descanso',
      'salud-mental': 'Salud mental',
      prevencion: 'Prevención',
      bienestar: 'Bienestar'
    };
    return labels[category] || labels['bienestar'];
  }
}
