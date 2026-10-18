import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ejercicio } from '../models/ejercicio';
import { environment } from '../../environments/environment';

interface PaginacionResponse {
  results: Ejercicio[];
  count: number;
  next: string | null;
  previous: string | null;
}

@Injectable({ providedIn: 'root' })
export class EjercicioService {
  private apiUrl = `${environment.backendUrl}/api/ejercicios/`;

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

  
  /** Sube o reemplaza la imagen (solo admin: necesita la cookie de sesión). */
  subirImagen(id: number, imagen: File): Observable<Ejercicio> {
    const datos = new FormData();
    datos.append('imagen', imagen);
    return this.http.post<Ejercicio>(`${this.apiUrl}${id}/imagen/`, datos, {
      withCredentials: true,
    });
  }

  eliminarImagen(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/imagen/`, {
      withCredentials: true,
    });
  }
}
