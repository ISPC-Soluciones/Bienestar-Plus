import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ejercicio {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
}

@Injectable({ providedIn: 'root' })
export class EjercicioService {
  private API_URL = 'http://127.0.0.1:8000/api/ejercicios/';

  constructor(private http: HttpClient) {}

  listar(): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.API_URL);
  }

  crear(ejercicio: Ejercicio): Observable<Ejercicio> {
    return this.http.post<Ejercicio>(this.API_URL, ejercicio);
  }

  actualizar(id: number, ejercicio: Ejercicio): Observable<Ejercicio> {
    return this.http.put<Ejercicio>(`${this.API_URL}${id}/`, ejercicio);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}${id}/`);
  }
}
