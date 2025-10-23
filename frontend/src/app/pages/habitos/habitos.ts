import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EjercicioService } from '../../services/ejercicio';
import { RutinaEjercicioService } from '../../services/rutina-ejercicio';
import { Ejercicio, RutinaEjercicio } from '../../models/ejercicio';
import { EstadisticasService } from '../../services/estadisticas.service';

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './habitos.html',
  styleUrls: ['./habitos.css'],
  providers: [EjercicioService, RutinaEjercicioService],
})
export class Habitos implements OnInit {
  activeTab: string = 'ejercicio';
  ejerciciosDisponibles: Ejercicio[] = [];
  rutinaDelUsuario: RutinaEjercicio[] = [];

  rutinaIdEnEdicion: number | null = null;

  cantidadEnEdicion: number | undefined;

  usuarioNombre: string = 'Cosme';
  usuarioIdAutenticado: number = 1;

  constructor(
    private ejercicioService: EjercicioService,
    private rutinaService: RutinaEjercicioService,
    private estadisticasService: EstadisticasService
  ) {}

  ngOnInit(): void {
    this.cargarEjerciciosDisponibles();
    this.cargarRutinaDelUsuario();
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  obtenerRutaImagen(nombre: string): string {
    const nombreLimpio = nombre.toLowerCase().replace(/ /g, '');
    return `assets/${nombreLimpio}.jpg`;
  }

  cargarEjerciciosDisponibles(): void {
    this.ejercicioService.obtenerEjercicios().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.ejerciciosDisponibles = response;
        } else if (response && 'results' in response) {
          this.ejerciciosDisponibles = response.results;
        } else {
          this.ejerciciosDisponibles = [];
          console.warn('Formato inesperado de respuesta:', response);
        }
      },
      error: (err) => console.error('Error cargando ejercicios:', err),
    });
  }

  cargarRutinaDelUsuario(): void {
    this.rutinaService
      .obtenerRutinaDelUsuario(this.usuarioIdAutenticado)
      .subscribe({
        next: (rutina) => {
          console.log('🧩 Datos recibidos de la API rutina:', rutina);

          if (Array.isArray(rutina)) {
            this.rutinaDelUsuario = rutina;
          } else if (rutina && 'results' in rutina) {
            this.rutinaDelUsuario = rutina.results;
          } else {
            console.warn('⚠️ Respuesta inesperada del backend:', rutina);
            this.rutinaDelUsuario = [];
          }
        },
        error: (err) => {
          console.error('Error cargando rutina del usuario:', err);
          this.rutinaDelUsuario = [];
        },
      });
  }

  estaEnRutina(ejercicio: Ejercicio): boolean {
    if (!ejercicio.id) return false;
    if (!Array.isArray(this.rutinaDelUsuario)) return false;
    return this.rutinaDelUsuario.some((r) => r.ejercicio === ejercicio.id);
  }

  agregarEjercicioARutina(ejercicio: Ejercicio): void {
    if (!ejercicio.id || this.estaEnRutina(ejercicio)) return;

    const metaPorDefecto = 20;

    this.rutinaService
      .agregarARutina(this.usuarioIdAutenticado, ejercicio.id, metaPorDefecto)
      .subscribe({
        next: () => {
          this.cargarRutinaDelUsuario();

          this.estadisticasService.emitirRefresco();
        },
        error: (err) => {
          console.error('Error agregando ejercicio a la rutina:', err);
        },
      });
  }

  // =========================================================
  // LÓGICA DE GESTIÓN DE RUTINA (CRUD - Actualización/Eliminación/Check)
  // =========================================================

  entrarEnModoEdicion(rutina: RutinaEjercicio): void {
    if (!rutina.id || rutina.completado) return;
    this.rutinaIdEnEdicion = rutina.id;
    this.cantidadEnEdicion = rutina.meta_cantidad;
  }

  cancelarEdicion(): void {
    this.rutinaIdEnEdicion = null;
    this.cantidadEnEdicion = undefined;
  }

  guardarEdicion(rutina: RutinaEjercicio): void {
    if (
      !rutina.id ||
      this.cantidadEnEdicion === undefined ||
      this.cantidadEnEdicion <= 0
    ) {
      console.error('La cantidad debe ser un número positivo.');
      return;
    }

    const nuevaCantidad = this.cantidadEnEdicion;

    this.rutinaService
      .actualizarRutina(rutina.id, { meta_cantidad: nuevaCantidad })
      .subscribe({
        next: (rutinaActualizada) => {
          rutina.meta_cantidad = rutinaActualizada.meta_cantidad;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar la meta:', err),
      });
  }

  eliminarRutina(id?: number): void {
    if (!id) return;

    this.rutinaService.eliminarRutina(id).subscribe({
      next: () => {
        this.rutinaDelUsuario = this.rutinaDelUsuario.filter(
          (r) => r.id !== id
        );
      },
      error: (err) => console.error('Error al eliminar el ejercicio:', err),
    });
  }

  marcarCompletado(rutina: RutinaEjercicio): void {
    if (!rutina.id || rutina.completado) return;

    const nuevoEstado = true;

    this.rutinaService
      .actualizarRutina(rutina.id, { completado: nuevoEstado })
      .subscribe({
        next: (rutinaActualizada) => {
          rutina.completado = rutinaActualizada.completado;
          this.cancelarEdicion();
        },
        error: (err) => console.error('Error al marcar como completado:', err),
      });
  }
}
