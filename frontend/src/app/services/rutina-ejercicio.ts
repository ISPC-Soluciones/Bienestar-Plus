import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RutinaEjercicio } from '../models/ejercicio'; 

// NUEVO: Interfaz para tipar los datos parciales que se envían en la actualización (PATCH)
interface RutinaUpdate {
    meta_cantidad?: number;
    completado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RutinaEjercicioService {
  private apiUrl = 'http://localhost:8000/api/rutinas/'; 

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la rutina de ejercicios del usuario para hoy, filtrando por usuario_id.
   */
 obtenerRutinaDelUsuario(
  usuarioId: number
 ): Observable<RutinaEjercicio[] | { results: RutinaEjercicio[] }> {
    const params = new HttpParams().set('usuario_id', usuarioId.toString());
    return this.http.get<RutinaEjercicio[] | { results: RutinaEjercicio[] }>(
      this.apiUrl,
      { params }
    );
}


  /**
   * Registra un ejercicio en la rutina del usuario.
   */
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
   * NUEVO: Actualiza parcialmente un registro de rutina (PATCH).
   * Se usa para cambiar la cantidad o marcar como completado.
   * @param id ID del registro de rutina (RutinaEjercicio.id).
   * @param data Objeto con los campos a actualizar (meta_cantidad o completado).
   */
  actualizarRutina(id: number, data: RutinaUpdate): Observable<RutinaEjercicio> {
    return this.http.patch<RutinaEjercicio>(`${this.apiUrl}${id}/`, data);
  }

  /**
   * NUEVO: Elimina un registro de rutina (DELETE).
   * @param id ID del registro de rutina (RutinaEjercicio.id).
   */
  eliminarRutina(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}