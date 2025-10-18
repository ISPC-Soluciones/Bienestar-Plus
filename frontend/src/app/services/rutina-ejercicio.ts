// ==========================================================
// src/app/services/rutina-ejercicio.service.ts
// ==========================================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================================
// INTERFACES (Exportadas para usarlas en el componente)
// ==========================================================
export interface Ejercicio {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
}

export interface RutinaEjercicio {
  id: number;
  usuario: number;
  ejercicio: Ejercicio;
  completado: boolean;
  fecha_registro: string;
  meta_cantidad?: number;
}

@Injectable({ providedIn: 'root' })
export class RutinaEjercicioService {
  private baseUrl = 'http://localhost:8000/api/';
  private ejerciciosUrl = this.baseUrl + 'ejercicios/';
  private rutinasUrl = this.baseUrl + 'rutinas-ejercicio/';

  constructor(private http: HttpClient) {}

  /** Trae los ejercicios disponibles creados por el admin */
  obtenerEjercicios(): Observable<Ejercicio[]> {
    return this.http.get<Ejercicio[]>(this.ejerciciosUrl);
  }

  /** Trae la rutina personalizada del usuario */
  obtenerRutina(usuarioId: number): Observable<RutinaEjercicio[]> {
    return this.http.get<RutinaEjercicio[]>(`${this.rutinasUrl}?usuario=${usuarioId}`);
  }

  /** Agrega un ejercicio a la rutina del usuario */
  agregarEjercicio(usuarioId: number, ejercicioId: number): Observable<RutinaEjercicio> {
    const payload = { usuario: usuarioId, ejercicio: ejercicioId, completado: false };
    return this.http.post<RutinaEjercicio>(this.rutinasUrl, payload);
  }

  /** Elimina un ejercicio de la rutina */
  eliminarDeRutina(rutinaId: number): Observable<void> {
    return this.http.delete<void>(`${this.rutinasUrl}${rutinaId}/`);
  }

  /** Marca o desmarca como completado */
  toggleCompletado(rutinaId: number, completado: boolean): Observable<RutinaEjercicio> {
    return this.http.patch<RutinaEjercicio>(`${this.rutinasUrl}${rutinaId}/`, { completado });
  }
}