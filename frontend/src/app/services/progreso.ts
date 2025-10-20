// ==========================================================
// src/app/services/progreso.service.ts (CORREGIDO)
// ==========================================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Habito {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface ProgresoDiario {
  id: number;
  habito: Habito;
  completado: boolean;
  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProgresoService {
  // 💡 CORRECCIÓN CLAVE: La URL base es solo 'http://localhost:8000/api'
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /** Llama a http://localhost:8000/api/progreso/?usuario_id=<id> */
  getProgresoDiario(usuarioId: number): Observable<ProgresoDiario[]> {
    return this.http.get<ProgresoDiario[]>(
      `${this.baseUrl}/progreso/?usuario_id=${usuarioId}`
    );
  }

  /** Llama a http://localhost:8000/api/progreso/<id>/ para actualizar */
  marcarCompletado(id: number, completado: boolean): Observable<any> {
    // Si Django espera /api/progreso/1/
    return this.http.patch(`${this.baseUrl}/progreso/${id}/`, { completado });
  }

  /** Llama a http://localhost:8000/api/progreso/ (Si es un endpoint de acción masiva) */
  actualizarProgreso(progresoId: number, completado: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/progreso/`, {
      progreso_id: progresoId,
      completado: completado,
    });
  }
 
  /** Llama a http://localhost:8000/api/checklist/ (Ajustar según la ruta de Django) */
  obtenerChecklist(fecha?: string): Observable<ProgresoDiario[]> {
    let params = new HttpParams();
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    // Asumimos que el endpoint es /api/checklist/
    return this.http.get<ProgresoDiario[]>(`${this.baseUrl}/checklist/`, { 
      params,
    });
  }

  /** Llama a http://localhost:8000/api/progreso/<id>/toggle/ (Ruta asumida para toggle) */
  toggleCompletado(
    progresoId: number,
    completado: boolean
  ): Observable<ProgresoDiario> {
    return this.http.patch<ProgresoDiario>(
      `${this.baseUrl}/progreso/${progresoId}/toggle/`, 
      { completado }
    );
  }
}