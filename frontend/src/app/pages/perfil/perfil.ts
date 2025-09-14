import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../models/perfil.model';
import { PerfilService } from '../../services/perfil';
import { Notificaciones, Notificacion } from '../../services/notificaciones';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  usuario?: Usuario;
  loading = false;
  error = '';

  listaDeNotificaciones: Notificacion[] = [];

  // 1. Inyecta ActivatedRoute en el constructor
  constructor(
    private perfilService: PerfilService,
    private route: ActivatedRoute,
    private notificacionesService: Notificaciones
  ) {}

  ngOnInit(): void {

    this.listaDeNotificaciones = this.notificacionesService.getNotificaciones();
    this.loading = true;

    // 2. Lee el 'id' de la URL de forma segura
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        // 3. Pasa el id de la URL a tu servicio
        this.perfilService.getUsuarioConHabitos(+id).subscribe({
          next: (u) => {
            this.usuario = u;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'No se pudo cargar el perfil';
            this.loading = false;
          },
        });
      } else {
        this.error = 'No se encontró el ID del usuario en la URL.';
        this.loading = false;
      }
    });
  };

  toggleNotificacion(id: number): void {
    this.notificacionesService.toggleNotificacion(id);
    this.listaDeNotificaciones = this.notificacionesService.getNotificaciones();
  };

}
