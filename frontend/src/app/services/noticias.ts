import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NoticiasResponse } from '../models/noticia.model';

@Injectable({
  providedIn: 'root'
})
export class Noticias {
  private readonly apiUrl = `${environment.backendUrl}/api/noticias/`;

  constructor(private http: HttpClient) {}

  getNews(): Observable<NoticiasResponse> {
    return this.http.get<NoticiasResponse>(this.apiUrl);
  }
}
