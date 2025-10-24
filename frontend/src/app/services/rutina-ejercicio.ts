import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RutinaEjercicio } from '../models/ejercicio';
import { environment } from '../../environments/environment';

interface RutinaUpdate {
  meta_cantidad?: number;
  completado?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RutinaEjercicioService {
  private apiUrl = `${environment.backendUrl}/api/rutinas-ejercicio/`;

  constructor(private http: HttpClient) {}

  obtenerRutinaDelUsuario(
    usuarioId: number
  ): Observable<RutinaEjercicio[] | { results: RutinaEjercicio[] }> {
    const params = new HttpParams().set('usuario_id', usuarioId.toString());
    return this.http.get<RutinaEjercicio[] | { results: RutinaEjercicio[] }>(
      this.apiUrl,
      { params }
    );
  }

  agregarARutina(
    usuarioId: number,
    ejercicioId: number,
    metaCantidad: number
  ): Observable<any> {
    const data = {
      usuario: usuarioId,
      ejercicio: ejercicioId,
      meta_cantidad: metaCantidad,
    };
    return this.http.post<any>(this.apiUrl, data);
  }

  /**
   * @param id ID del registro de rutina (RutinaEjercicio.id).
   * @param data Objeto con los campos a actualizar (meta_cantidad o completado).
   */
  actualizarRutina(
    id: number,
    data: RutinaUpdate
  ): Observable<RutinaEjercicio> {
    return this.http.patch<RutinaEjercicio>(`${this.apiUrl}${id}/`, data);
  }

  /**
   * @param id ID del registro de rutina (RutinaEjercicio.id).
   */
  eliminarRutina(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
