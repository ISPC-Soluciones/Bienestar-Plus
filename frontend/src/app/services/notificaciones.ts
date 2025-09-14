import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Notificacion {
  id: number;
  mensaje: string;
  activado: boolean;
  fecha?: Date;
};

@Injectable({
  providedIn: 'root'
})
export class Notificaciones {
  private notificaciones: Notificacion[] = [
    { id: 1, mensaje: 'Recordatorio para beber agua', activado: true, fecha: new Date() },
    { id: 2, mensaje: 'Recordatorio para registrar desayuno', activado: false, fecha: new Date() },
    { id: 3, mensaje: 'Recordatorio para actividad física', activado: true, fecha: new Date() }
  ];

  constructor(private http: HttpClient) { };

  getNotificaciones(): Notificacion[] {
    return this.notificaciones;
  };

  toggleNotificacion(id: number): void {
    const notificacion = this.notificaciones.find(n => n.id === id);
    if (notificacion) {
      notificacion.activado = !notificacion.activado;
    }
  };
}
