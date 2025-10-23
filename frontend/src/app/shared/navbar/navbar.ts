import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalNotificacionesComponent } from '../../pages/modal-notificaciones/modal-notificaciones';
import { Notificacion } from '../../models/notificacion';
import { NotificacionesService } from '../../services/notificaciones';
import { AuthService } from '../../services/auth';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalNotificacionesComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnDestroy {
  userId$: Observable<number | null>;
  private authSubscription!: Subscription;

  modalNotificacionesAbierto = false;
  notificaciones: Notificacion[] = [];
  notificacionesSinLeer = 0;

  constructor(
    private authService: AuthService,
    private notificacionesService: NotificacionesService
  ) {
    this.userId$ = this.authService.currentUserId$;

    this.authSubscription = this.userId$.subscribe(userId => {
      if (userId) this.cargarNotificaciones(userId);
      else this.notificacionesSinLeer = 0;
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) this.authSubscription.unsubscribe();
  }

  cargarNotificaciones(userId: number): void {
    this.notificacionesService.getNotificacionesPorUsuario(userId).subscribe({
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : res.results ?? [];
        this.notificaciones = lista;
        this.notificacionesSinLeer = lista.filter((n: any) => n.estado !== 'leido').length;
      },
      error: (err) => console.error('Error al cargar notificaciones', err)
    });
  }

  abrirModalNotificaciones(userId: number): void {
    this.cargarNotificaciones(userId);
    this.modalNotificacionesAbierto = true;
  }

  cerrarModalNotificaciones(): void {
    this.modalNotificacionesAbierto = false;
  }


  async onNotificacionesCambiaron(): Promise<void> {
    const userId = await firstValueFrom(this.userId$);
    if (userId) {
      this.cargarNotificaciones(userId);
    }
  }
}
