import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../environments/enviroment';

export interface Habito {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Ejercicio {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  duracion: number;
}

export interface ProgresoDiario {
  id: number;
  fecha: string;
  habito: Habito;
  usuario: number;
  completado: boolean;
  ejercicio?: Ejercicio | null;
}

@Injectable({
  providedIn: 'root',
})
export class HabitosService {
  private apiProgresos = `${environment.backendUrl}api/progresoschecklist/`;
  private apiEjercicios = `${environment.backendUrl}api/ejercicios/`;

  constructor(private http: HttpClient) {}
  private baseUrl = `${environment.backendUrl}api/habitos`;

  /**
   * Obtener checklist para un usuario.
   * @param usuarioId
   * @param fecha
   */
  obtenerChecklist(
    usuarioId: number | string,
    fecha?: string
  ): Observable<ProgresoDiario[]> {
    let params = new HttpParams().set('usuario_id', String(usuarioId));
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    return this.http.get<ProgresoDiario[]>(this.baseUrl + '/', { params });
  }

  obtenerProgresos(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiProgresos}?usuario_id=${usuarioId}`);
  }

  alternarCompletado(id: number): Observable<any> {
    return this.http.post(`${this.apiProgresos}${id}/toggle/`, {});
  }

  obtenerEjercicios(): Observable<{ results: Ejercicio[] }> {
    return this.http.get<{ results: Ejercicio[] }>(this.apiEjercicios);
  }

  agregarEjercicioAChecklist(ejercicioId: number) {
    return this.http.post<ProgresoDiario>(
      `${this.baseUrl}/progresoschecklist/`,
      { ejercicio_id: ejercicioId }
    );
  }

  quitarProgreso(progresoId: number) {
    return this.http.delete(
      `${this.baseUrl}/progresoschecklist/${progresoId}/`
    );
  }

  toggleCompletado(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/toggle/`, {});
  }
}
