import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  fecha_registro?: string;
}

interface UsuariosResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Usuario[];
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class AdminUsuarios implements OnInit {
  usuarios: Usuario[] = [];
  cargando = false;

  private apiUrl = `${environment.backendUrl}/api/usuarios/`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.usuarios = [];
  
    this.cargarPagina(this.apiUrl);
  }
  
  private cargarPagina(url: string): void {
    this.http.get<UsuariosResponse>(url).subscribe({
      next: (response) => {
        this.usuarios = [
          ...this.usuarios,
          ...response.results
        ];
  
        if (response.next) {
          this.cargarPagina(response.next);
        } else {
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.cargando = false;
      },
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmar = confirm(`¿Eliminar al usuario ${usuario.nombre}?`);

    if (!confirmar) return;

    this.http.delete(`${this.apiUrl}${usuario.id}/`).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((u) => u.id !== usuario.id);
      },
      error: (err) => console.error('Error eliminando usuario', err),
    });
  }
}
interface UsuariosResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Usuario[];
  }