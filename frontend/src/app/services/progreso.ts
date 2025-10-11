import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  private baseUrl = 'http://localhost:8000/api'; 

  constructor(private http: HttpClient) {}

  getProgresoDiario(usuarioId: number): Observable<ProgresoDiario[]> {
    return this.http.get<ProgresoDiario[]>(`${this.baseUrl}/progreso/?usuario_id=${usuarioId}`);
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
}
