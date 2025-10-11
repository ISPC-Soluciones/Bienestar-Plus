import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProgresoDiario {
  id: number;
  fecha: string;
  completado: boolean;
  habito: {
    id: number;
    nombre: string;
    descripcion: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ProgresoService {
  private base = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getProgresoDiario(usuarioId: number): Observable<ProgresoDiario[]> {
    return this.http.get<ProgresoDiario[]>(
      `${this.base}/progreso/?usuario_id=${usuarioId}`
    );
  }

  marcarCompletado(progresoId: number, completado: boolean) {
    return this.http.patch(`${this.base}/progreso/`, {
      progreso_id: progresoId,
      completado,
    });
  }
}
