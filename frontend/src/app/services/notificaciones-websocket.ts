import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Notificacion } from '../models/notificacion';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesWebSocketService implements OnDestroy {

  private socket: WebSocket | null = null;

  private nuevaNotificacionSubject =
    new Subject<Notificacion>();

  nuevaNotificacion$ =
    this.nuevaNotificacionSubject.asObservable();

  conectar(usuarioId: number): void {

    if (this.socket) {
      this.socket.close();
    }

    const url =
      `ws://localhost:8000/ws/notificaciones/${usuarioId}/`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket de notificaciones conectado');
    };

    this.socket.onmessage = (event) => {

      const data = JSON.parse(event.data);

      console.log(
        'Nueva notificación recibida por WebSocket:',
        data
      );

      const notificacion: Notificacion = {
        id: data.notificacion_id,
        usuario: usuarioId,
        mensaje: data.mensaje,
        estado: 'pendiente',
        enviado: null,
        leido: null
      };

      this.nuevaNotificacionSubject.next(notificacion);
    };

    this.socket.onerror = (error) => {
      console.error(
        'Error en WebSocket de notificaciones:',
        error
      );
    };

    this.socket.onclose = () => {
      console.log(
        'WebSocket de notificaciones desconectado'
      );
    };
  }

  desconectar(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  ngOnDestroy(): void {
    this.desconectar();
  }
}