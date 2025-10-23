import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Noticias } from '../../services/noticias';

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
      this.articles = data.articles.filter((article: any) => article.urlToImage);
    });
  }

}
