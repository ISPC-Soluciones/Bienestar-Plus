import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ejercicio } from '../models/ejercicio';
import { environment } from './../../environments/environment';

interface PaginacionResponse {
  results: Ejercicio[];
  count: number;
  next: string | null;
  previous: string | null;
}

@Injectable({ providedIn: 'root' })
export class EjercicioService {
  private apiUrl = `${environment.backendUrl}/api/rutinas-ejercicio/`;

  constructor(private http: HttpClient) {}

  obtenerEjercicios(): Observable<PaginacionResponse> {
    return this.http.get<PaginacionResponse>(this.apiUrl);
  }

  crearEjercicio(ejercicio: Ejercicio): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(this.apiUrl, ejercicio);
  }

  actualizarEjercicio(id: number, ejercicio: Ejercicio): Observable<Ejercicio> {
    return this.http.put<Ejercicio>(`${this.apiUrl}${id}/`, ejercicio);
  }

  eliminarEjercicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
