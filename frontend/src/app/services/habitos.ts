// src/app/services/habitos.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  providedIn: 'root'
})
export class HabitosService {
  private apiProgresos = 'http://localhost:8000/api/progresoschecklist/';
  private apiEjercicios = 'http://localhost:8000/api/ejercicios/';

  constructor(private http: HttpClient) {}
  private baseUrl = 'http://localhost:8000/api/habitos';

  /**
   * Obtener checklist para un usuario.
   * @param usuarioId id del usuario (requerido por tu viewset)
   * @param fecha opcional 'YYYY-MM-DD'
   */
  obtenerChecklist(usuarioId: number | string, fecha?: string): Observable<ProgresoDiario[]> {
    let params = new HttpParams().set('usuario_id', String(usuarioId));
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    return this.http.get<ProgresoDiario[]>(this.baseUrl + '/', { params });
  }

  obtenerProgresos(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiProgresos}?usuario_id=${usuarioId}`);
  }

  // ✅ Alternar el completado de un progreso
  alternarCompletado(id: number): Observable<any> {
    return this.http.post(`${this.apiProgresos}${id}/toggle/`, {});
  }

  // ✅ NUEVO: Obtener lista de ejercicios disponibles
  obtenerEjercicios(): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.apiEjercicios);
  }

  agregarEjercicioAChecklist(ejercicioId: number) {
    return this.http.post<ProgresoDiario>(`${this.baseUrl}/progresoschecklist/`, { ejercicio_id: ejercicioId });
  }
  
  quitarProgreso(progresoId: number) {
    return this.http.delete(`${this.baseUrl}/progresoschecklist/${progresoId}/`);
  }

  /**
   * Alterna completado (POST a /{id}/toggle/ según viewset)
   * Retorna el ProgresoDiario actualizado (según lo que devuelva el backend).
   */
  toggleCompletado(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/toggle/`, {});
  }
}
