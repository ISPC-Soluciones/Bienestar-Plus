import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recurso, RecursosApiResponse } from '../models/recurso.model';

@Injectable({
  providedIn: 'root'
})
export class RecursosService {
  private readonly apiUrl = `${environment.backendUrl}/api/recursos/`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de recursos disponibles.
   * Soporta respuestas paginadas de DRF ({ results: [...] }) o listas directas ([...]).
   * La ausencia de recursos o errores de red devuelven una lista vacía de forma segura.
   */
  getRecursos(tipo?: string, usuarioId?: number): Observable<Recurso[]> {
    let params = new HttpParams();
    if (tipo && tipo.trim() !== '' && tipo.toLowerCase() !== 'todos') {
      params = params.set('tipo', tipo.trim());
    }
    if (usuarioId) {
      params = params.set('usuario_id', usuarioId.toString());
    }

    return this.http.get<RecursosApiResponse | Recurso[]>(this.apiUrl, { params }).pipe(
      map((response) => {
        if (!response) {
          return [];
        }
        if (Array.isArray(response)) {
          return response;
        }
        if (response.results && Array.isArray(response.results)) {
          return response.results;
        }
        return [];
      }),
      catchError((error) => {
        console.error('Error al obtener recursos del backend:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un recurso por su ID.
   */
  getRecursoPorId(id: number): Observable<Recurso | null> {
    return this.http.get<Recurso>(`${this.apiUrl}${id}/`).pipe(
      catchError((error) => {
        console.error(`Error al obtener el recurso ${id}:`, error);
        return of(null);
      })
    );
  }
}
