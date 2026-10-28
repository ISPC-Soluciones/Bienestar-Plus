import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Notificacion } from '../models/notificacion';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesWebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;

  private nuevaNotificacionSubject = new Subject<Notificacion>();

  nuevaNotificacion$ = this.nuevaNotificacionSubject.asObservable();

  conectar(usuarioId: number): void {
    if (this.socket) {
      this.socket.close();

      if (
        environment.production &&
        environment.backendUrl.includes('vercel.app')
      ) {
        console.warn(
          'Websockets omitidos: Vercel no soporta conexiones persistentes de WebSocket.',
        );
        return;
      }
    }

    // 1. Si estamos en producción pura (Vercel), los WebSockets no funcionarán por restricciones del hosting.
    // Opcionalmente puedes omitir la conexión para evitar errores molestos en la consola:
    if (
      environment.production &&
      environment.backendUrl.includes('vercel.app')
    ) {
      console.warn(
        'Websockets omitidos: Vercel no soporta conexiones persistentes de WebSocket.',
      );
      return;
    }

    // 2. Transformar la URL HTTP/HTTPS del environment a WS/WSS automáticamente
    const wsProtocol = environment.backendUrl.startsWith('https')
      ? 'wss://'
      : 'ws://';
    const cleanHost = environment.backendUrl.replace(/^https?:\/\//, '');
    const url = `${wsProtocol}${cleanHost}/ws/notificaciones/${usuarioId}/`;

    console.log(`Conectando WebSocket a: ${url}`);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket de notificaciones conectado');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log('Nueva notificación recibida por WebSocket:', data);

      const notificacion: Notificacion = {
        id: data.notificacion_id,
        usuario: usuarioId,
        mensaje: data.mensaje,
        estado: 'pendiente',
        enviado: null,
        leido: null,
      };

      this.nuevaNotificacionSubject.next(notificacion);
    };

    this.socket.onerror = (error) => {
      console.error('Error en WebSocket de notificaciones:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket de notificaciones desconectado');
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
