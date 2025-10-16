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
  private baseUrl = 'http://localhost:8000/api/progresos';

  constructor(private http: HttpClient) {}

  getProgresoDiario(usuarioId: number): Observable<ProgresoDiario[]> {
    return this.http.get<ProgresoDiario[]>(
      `${this.baseUrl}/progreso/?usuario_id=${usuarioId}`
    );
  }

  marcarCompletado(id: number, completado: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/`, { completado });
  }

  actualizarProgreso(progresoId: number, completado: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/progreso/`, {
      progreso_id: progresoId,
      completado: completado,
    });
  }

  obtenerChecklist(fecha?: string): Observable<ProgresoDiario[]> {
    let params = new HttpParams();
    // Si hay fecha, la agregamos como query parameter
    if (fecha) {
      params = params.set('fecha', fecha);
    }
    return this.http.get<ProgresoDiario[]>(`${this.baseUrl}checklist/`, {
      params,
    });
  }

  toggleCompletado(
    progresoId: number,
    completado: boolean
  ): Observable<ProgresoDiario> {
    // La URL debe ser específica para el recurso: /progresos/<id>/toggle/
    return this.http.patch<ProgresoDiario>(
      `${this.baseUrl}${progresoId}/toggle/`,
      { completado }
    );
  }
}
