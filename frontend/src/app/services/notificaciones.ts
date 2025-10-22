import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Notificacion } from '../models/notificacion';
import { ID } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private baseUrl = 'http://localhost:8000/api/notificaciones/';

  constructor(private http: HttpClient) {}

  /** 📥 Obtiene todas las notificaciones del usuario */
  getNotificacionesPorUsuario(usuarioId: ID): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.baseUrl}?usuario=${usuarioId}`)
      .pipe(
        tap(res => console.log(' Notificaciones cargadas:', res))
      );
  }

  /** 📨 Marca una notificación como leída o pendiente */
  marcarComoLeida(id: ID): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.baseUrl}${id}/`, { estado: 'leido' });
  }
}
