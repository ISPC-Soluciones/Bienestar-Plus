import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Noticias {
  private apiKey = 'b436bd8c4cb54192a8ce45d1557417a1'; 
  private apiUrl: string; 

  constructor(private http: HttpClient) {
    const query = 'health diet';

    this.apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=es&sortBy=publishedAt&apiKey=${this.apiKey}`;
  }

  getNews(): Observable<any> {
    console.log("Consultando la URL:", this.apiUrl);
    return this.http.get(this.apiUrl);
  }
}