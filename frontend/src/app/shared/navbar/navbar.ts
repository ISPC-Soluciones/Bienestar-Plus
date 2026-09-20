import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalNotificacionesComponent } from '../../pages/modal-notificaciones/modal-notificaciones';
import { Notificacion } from '../../models/notificacion';
import { NotificacionesService } from '../../services/notificaciones';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login';
import { NotificacionesWebSocketService } from '../../services/notificaciones-websocket';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ModalNotificacionesComponent
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnDestroy {

  userId$: Observable<number | null>;

  private authSubscription!: Subscription;
  private webSocketSubscription!: Subscription;

  modalNotificacionesAbierto = false;

  notificaciones: Notificacion[] = [];

  notificacionesSinLeer = 0;

  constructor(
    private authService: AuthService,
    private notificacionesService: NotificacionesService,
    private notificacionesWebSocketService: NotificacionesWebSocketService,
    private router: Router,
    private loginService: LoginService
  ) {

    this.userId$ = this.authService.currentUserId$;

    this.authSubscription = this.userId$.subscribe(userId => {

      if (userId) {

        // Carga inicial de notificaciones mediante HTTP
        this.cargarNotificaciones(userId);

        // Conexión en tiempo real
        this.conectarWebSocket(userId);

      } else {

        // Usuario desconectado
        this.notificaciones = [];
        this.notificacionesSinLeer = 0;

        this.notificacionesWebSocketService.desconectar();

        if (this.webSocketSubscription) {
          this.webSocketSubscription.unsubscribe();
        }
      }
    });
  }

 
  // DESTRUCCIÓN DEL COMPONENTE


  ngOnDestroy(): void {

    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }

    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }

    this.notificacionesWebSocketService.desconectar();
  }


  // logica WEBSOCKET


  private conectarWebSocket(userId: number): void {

    // Si ya había una suscripción, la eliminamos
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }

    // Coneccion al WebSocket del usuario actual
    this.notificacionesWebSocketService.conectar(userId);

    // para saber de  nuevas notificaciones
    this.webSocketSubscription =
      this.notificacionesWebSocketService.nuevaNotificacion$
        .subscribe((notificacion) => {

          console.log(
            'Navbar recibió nueva notificación:',
            notificacion
          );

          // Agregola nueva notificación a la lista
          this.notificaciones.push(notificacion);

          // Actualizo el contador del círculo rojo
          this.notificacionesSinLeer =
            this.notificaciones.filter(
              n => n.estado !== 'leido'
            ).length;
        });
  }


  // CARGAR NOTIFICACIONES


  cargarNotificaciones(userId: number): void {

    this.notificacionesService
      .getNotificacionesPorUsuario(userId)
      .subscribe({

        next: (res: any) => {

          const lista = Array.isArray(res)
            ? res
            : res.results ?? [];

          this.notificaciones = lista;

          this.notificacionesSinLeer =
            lista.filter(
              (n: Notificacion) => n.estado !== 'leido'
            ).length;

          console.log(
            'Notificaciones cargadas:',
            this.notificaciones
          );
        },

        error: (err) => {
          console.error(
            'Error al cargar notificaciones:',
            err
          );
        }
      });
  }

  // ABRIR MODAL


  abrirModalNotificaciones(userId: number): void {

    // Mantenemos el GET como sincronización/fallback
    this.cargarNotificaciones(userId);

    this.modalNotificacionesAbierto = true;
  }


  // Cierro MODAL


  cerrarModalNotificaciones(): void {
    this.modalNotificacionesAbierto = false;
  }


  // CUANDO CAMBIA UNA NOTIFICACIÓN


  async onNotificacionesCambiaron(): Promise<void> {

    const userId = await firstValueFrom(
      this.userId$
    );

    if (userId) {
      this.cargarNotificaciones(userId);
    }
  }


  // CERRAR SESIÓN


  cerrarSesion(): void {

    this.loginService.cerrarSesion().subscribe({

      next: () => {

        this.notificacionesWebSocketService.desconectar();

        this.authService.logout();

        this.router.navigate(['/home']);
      },

      error: (err) => {

        console.error(
          'Error al cerrar la sesión en el backend:',
          err
        );

        // 
        // limpiamos el estado local asi falle el back.
        this.notificacionesWebSocketService.desconectar();

        this.authService.logout();

        this.router.navigate(['/home']);
      }
    });
  }


  // COMPROBAR SI ES ADMIN


  esAdmin(): boolean {

    const usuarioGuardado =
      localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      return false;
    }

    try {

      const usuario =
        JSON.parse(usuarioGuardado);

      return usuario?.rol === 'admin';

    } catch {

      return false;
    }
  }
}