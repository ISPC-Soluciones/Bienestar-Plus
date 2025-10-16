import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Noticias } from '../../services/noticias/noticias';

@Component({
  selector: 'app-news-section',
  imports: [CommonModule],
  templateUrl: './news-section.html',
  styleUrl: './news-section.css'
})
export class NewsSection implements OnInit {

  articles: any[] = [];

  constructor(private noticias: Noticias) {}

 ngOnInit(): void {
    this.noticias.getNews().subscribe(data => {
      // Filtramos artículos que no tengan imagen para evitar errores visuales
      this.articles = data.articles.filter((article: any) => article.urlToImage);
    });
  }

}
