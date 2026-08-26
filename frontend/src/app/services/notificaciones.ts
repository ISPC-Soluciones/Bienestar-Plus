import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Notificacion } from '../models/notificacion';
import { ID } from '../models/perfil.model';
import { environment } from '../../environments/environment';

interface NotificacionesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notificacion[];
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private baseUrl = `${environment.backendUrl}/api/notificaciones/`;

  constructor(private http: HttpClient) {}

  getNotificacionesPorUsuario(usuarioId: ID): Observable<Notificacion[]> {
    return this.http
      .get<NotificacionesResponse>(
        `${this.baseUrl}?usuario_id=${usuarioId}`
      )
      .pipe(
        map((response) => response.results),
        tap((res) =>
          console.log('Notificaciones cargadas:', res)
        )
      );
  }

  actualizarEstado(
    id: ID,
    estado: 'pendiente' | 'leido'
  ): Observable<Notificacion> {
    return this.http.patch<Notificacion>(
      `${this.baseUrl}${id}/`,
      { estado }
    );
  }

  marcarComoLeida(id: ID): Observable<Notificacion> {
    return this.actualizarEstado(id, 'leido');
  }
}