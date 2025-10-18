import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Noticias {
  private apiKey = 'b436bd8c4cb54192a8ce45d1557417a1'; // Tu API Key
  private apiUrl: string; // La URL ahora se construirá en el constructor

  constructor(private http: HttpClient) {
    // 1. Cambiamos la consulta para buscar solo noticias de deporte.
    const query = 'deporte';

    // 2. Construimos la URL final, codificando la consulta para que sea segura
    // y manteniendo tu apiKey.
    this.apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=es&sortBy=publishedAt&apiKey=${this.apiKey}`;
  }

  // 3. El nombre del método se mantiene como getNews() para no romper el código
  getNews(): Observable<any> {
    console.log("Consultando la URL:", this.apiUrl); // Útil para depurar y ver la URL completa
    return this.http.get(this.apiUrl);
  }
}