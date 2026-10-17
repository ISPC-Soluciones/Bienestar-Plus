import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PerfilSalud } from '../../../models/perfil.model';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  telefono?: string;
  fecha_registro?: string;
  perfil_salud?: PerfilSalud;
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
  // ---- Datos ----
  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);

  // ---- Filtros ----
  filtroTexto = signal('');
  filtroMes = signal<number | null>(null);
  filtroAnio = signal<number | null>(null);
  filtroRol = signal('');

  meses = [
    { valor: 1, nombre: 'Enero' }, { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' }, { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' }, { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' }, { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' }, { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' }, { valor: 12, nombre: 'Diciembre' },
  ];

  aniosDisponibles = computed(() => {
    const anios = this.usuarios()
      .map(u => u.fecha_registro ? new Date(u.fecha_registro).getFullYear() : null)
      .filter((a): a is number => a !== null);
    return [...new Set(anios)].sort((a, b) => b - a);
  });

  usuariosFiltrados = computed(() => {
    const texto = this.filtroTexto().toLowerCase();
    const mes = this.filtroMes();
    const anio = this.filtroAnio();
    const rol = this.filtroRol();

    return this.usuarios().filter(usuario => {
      const coincideTexto = !texto ||
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.email.toLowerCase().includes(texto);

      const fecha = usuario.fecha_registro ? new Date(usuario.fecha_registro) : null;
      const coincideMes = !mes || (fecha !== null && fecha.getMonth() + 1 === mes);
      const coincideAnio = !anio || (fecha !== null && fecha.getFullYear() === anio);
      const coincideRol = !rol || usuario.rol === rol;

      return coincideTexto && coincideMes && coincideAnio && coincideRol;
    });
  });

  hayFiltrosActivos = computed(() =>
    !!this.filtroTexto() || !!this.filtroMes() || !!this.filtroAnio() || !!this.filtroRol()
  );

  // ---- Edición ----
  modalAbierto = signal(false);
  guardando = signal(false);
  errorEdicion = signal('');

  edicionId = signal<number | null>(null);
  edicionNombre = signal('');
  edicionEmail = signal('');
  edicionTelefono = signal('');
  edicionRol = signal('estandar');
  edicionPeso = signal<number | null>(null);
  edicionAltura = signal<number | null>(null);
  edicionGenero = signal('');
  edicionFechaNacimiento = signal('');

  private apiUrl = `${environment.backendUrl}/api/usuarios/`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuarios.set([]);
    this.cargarPagina(this.apiUrl);
  }

  private cargarPagina(url: string): void {
    this.http.get<UsuariosResponse>(url).subscribe({
      next: (response) => {
        this.usuarios.update(actuales => [...actuales, ...response.results]);

        if (response.next) {
          this.cargarPagina(response.next);
        } else {
          this.cargando.set(false);
        }
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.cargando.set(false);
      },
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmar = confirm(`¿Eliminar al usuario ${usuario.nombre}? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    this.http.delete(`${this.apiUrl}${usuario.id}/`).subscribe({
      next: () => {
        this.usuarios.update(actuales => actuales.filter((u) => u.id !== usuario.id));
      },
      error: (err) => console.error('Error eliminando usuario', err),
    });
  }

  // ---- Handlers de filtros (reemplazan a [(ngModel)]) ----

  onFiltroTextoChange(valor: string): void {
    this.filtroTexto.set(valor);
  }

  onFiltroMesChange(valor: string): void {
    this.filtroMes.set(valor ? Number(valor) : null);
  }

  onFiltroAnioChange(valor: string): void {
    this.filtroAnio.set(valor ? Number(valor) : null);
  }

  onFiltroRolChange(valor: string): void {
    this.filtroRol.set(valor);
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroMes.set(null);
    this.filtroAnio.set(null);
    this.filtroRol.set('');
  }

  // Los templates de Angular no pueden llamar a funciones globales como
  // Number(...) directamente, así que la envolvemos en un método propio.
  protected aNumeroONull(valor: string): number | null {          // <- NUEVO
    return valor ? Number(valor) : null;                          // <- NUEVO
  }                                                                 // <- NUEVO

  // ---- Edición ----

  abrirEdicion(usuario: Usuario): void {
    this.edicionId.set(usuario.id);
    this.edicionNombre.set(usuario.nombre);
    this.edicionEmail.set(usuario.email);
    this.edicionTelefono.set(usuario.telefono ?? '');
    this.edicionRol.set(usuario.rol);
    this.edicionPeso.set(usuario.perfil_salud?.peso ?? null);
    this.edicionAltura.set(
      usuario.perfil_salud?.altura ? Number(usuario.perfil_salud.altura) * 100 : null
    );
    this.edicionGenero.set(usuario.perfil_salud?.genero ?? '');
    this.edicionFechaNacimiento.set(usuario.perfil_salud?.fecha_nacimiento ?? '');

    this.errorEdicion.set('');
    this.modalAbierto.set(true);
  }

  cerrarEdicion(): void {
    this.modalAbierto.set(false);
    this.errorEdicion.set('');
  }

  guardarEdicion(): void {
    if (!this.edicionNombre() || !this.edicionEmail()) {
      this.errorEdicion.set('Nombre y email son obligatorios.');
      return;
    }

    const confirmar = confirm('¿Confirmás guardar estos cambios?');
    if (!confirmar) return;

    const id = this.edicionId();
    const altura = this.edicionAltura();

    const payload = {
      nombre: this.edicionNombre(),
      email: this.edicionEmail(),
      telefono: this.edicionTelefono(),
      rol: this.edicionRol(),
      perfil_salud: {
        peso: this.edicionPeso() || null,
        altura: altura ? altura / 100 : null,
        genero: this.edicionGenero() || null,
        fecha_nacimiento: this.edicionFechaNacimiento() || null,
      },
    };

    this.guardando.set(true);
    this.errorEdicion.set('');

    this.http.patch<{ data: Usuario }>(`${this.apiUrl}${id}/admin-editar/`, payload).subscribe({
      next: (respuesta) => {
        const actualizado = respuesta.data;
        this.usuarios.update(actuales =>
          actuales.map(u => (u.id === actualizado.id ? actualizado : u))
        );
        this.guardando.set(false);
        this.cerrarEdicion();
      },
      error: (err) => {
        console.error('Error guardando usuario', err);
        this.errorEdicion.set('No se pudo guardar. Revisá los datos e intentá de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}