import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Notificacion } from '../models/notificacion';
import { ID } from '../models/perfil.model';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private baseUrl = `${environment.backendUrl}/api/notificaciones/`;

  constructor(private http: HttpClient) {}

  getNotificacionesPorUsuario(usuarioId: ID): Observable<Notificacion[]> {
    return this.http
      .get<Notificacion[]>(`${this.baseUrl}?usuario=${usuarioId}`)
      .pipe(tap((res) => console.log(' Notificaciones cargadas:', res)));
  }

  marcarComoLeida(id: ID): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.baseUrl}${id}/`, {
      estado: 'leido',
    });
  }
}
