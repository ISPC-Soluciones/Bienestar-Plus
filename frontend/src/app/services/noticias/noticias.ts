import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Noticias {
  private apiKey = 'b436bd8c4cb54192a8ce45d1557417a1';
   private apiUrl = `https://newsapi.org/v2/everything?q=salud&language=es&sortBy=publishedAt&apiKey=${this.apiKey}`;

  constructor(private http: HttpClient) {}

  getNews(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
