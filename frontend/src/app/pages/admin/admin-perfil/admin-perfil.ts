import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { PerfilService } from '../../../services/perfil';
import { Usuario } from '../../../models/perfil.model';

@Component({
  selector: 'app-admin-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-perfil.html',
  styleUrl: './admin-perfil.css',
})
export class AdminPerfil implements OnInit {
  usuario?: Usuario;
  usuarioId: number | null = null;

  editando = false;
  cargando = true;
  guardando = false;

  mensaje = '';
  error = '';

  nombre = '';
  email = '';

  constructor(
    private authService: AuthService,
    private perfilService: PerfilService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUserId$.subscribe((id) => {
      this.usuarioId = id;

      if (id) {
        this.cargarUsuario(id);
      } else {
        this.cargando = false;
        this.error = 'No se pudo identificar al usuario administrador.';
      }
    });
  }

  cargarUsuario(id: number): void {
    this.cargando = true;
    this.error = '';

    this.perfilService.getUsuario(id).subscribe((usuario) => {
      if (!usuario) {
        this.error = 'No se pudieron cargar los datos del perfil.';
        this.cargando = false;
        return;
      }

      this.usuario = usuario;
      this.nombre = usuario.nombre ?? '';
      this.email = usuario.email ?? '';
      this.cargando = false;
    });
  }

  activarEdicion(): void {
    if (!this.usuario) return;

    this.nombre = this.usuario.nombre ?? '';
    this.email = this.usuario.email ?? '';

    this.mensaje = '';
    this.error = '';
    this.editando = true;
  }

  cancelarEdicion(): void {
    if (this.usuario) {
      this.nombre = this.usuario.nombre ?? '';
      this.email = this.usuario.email ?? '';
    }

    this.editando = false;
    this.mensaje = '';
    this.error = '';
  }

  guardarCambios(): void {
    if (!this.usuarioId) return;

    if (!this.nombre.trim() || !this.email.trim()) {
      this.error = 'Nombre y email son obligatorios.';
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    this.error = '';

    const datos = {
      nombre: this.nombre.trim(),
      email: this.email.trim(),
    };

    this.perfilService.updateUsuario(this.usuarioId, datos).subscribe((usuario) => {
      this.guardando = false;

      if (!usuario) {
        this.error = 'No se pudieron guardar los cambios.';
        return;
      }

      this.usuario = usuario;
      this.nombre = usuario.nombre ?? '';
      this.email = usuario.email ?? '';
      this.editando = false;
      this.mensaje = 'Perfil actualizado correctamente.';
    });
  }
}