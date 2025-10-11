import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ejercicio } from '../models/ejercicio';

@Injectable({ providedIn: 'root' })
export class EjercicioService {
  private apiUrl = 'http://localhost:8000/api/ejercicios/';

  constructor(private http: HttpClient) {}

  obtenerEjercicios(): Observable<{ results: Ejercicio[] }> {
    return this.http.get<{ results: Ejercicio[] }>(this.apiUrl);
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
