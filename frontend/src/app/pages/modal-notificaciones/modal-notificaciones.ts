import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notificacion } from '../../models/notificacion';
import { NotificacionesService } from '../../services/notificaciones';

@Component({
  selector: 'app-modal-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-notificaciones.html',
  styleUrls: ['./modal-notificaciones.css']
})
export class ModalNotificacionesComponent {
  @Input() abierto = false;
  @Input() notificaciones: Notificacion[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() notificacionesCambiaron = new EventEmitter<void>();

  constructor(private notiService: NotificacionesService) {}

  cerrarClick() {
    this.cerrar.emit();
  }

  toggleLeida(noti: Notificacion) {
    const nuevoEstado = noti.estado === 'leido' ? 'pendiente' : 'leido';
    this.notiService.marcarComoLeida(noti.id).subscribe({
      next: updated => {
        noti.estado = nuevoEstado;
        this.notificacionesCambiaron.emit();
      },
      error: err => console.error('Error al actualizar notificación', err)
    });
  }
}
