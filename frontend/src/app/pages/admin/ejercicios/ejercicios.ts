import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { EjercicioService } from '../../../services/ejercicio';
import { Ejercicio } from '../../../models/ejercicio';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANIO_MAXIMO_IMAGEN = 2 * 1024 * 1024; // 2 MB, igual que el backend

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejercicios.html',
  styleUrl: './ejercicios.css',
})
export class Ejercicios implements OnInit, OnDestroy {
  @ViewChild('inputImagen') inputImagen?: ElementRef<HTMLInputElement>;

  ejercicios: Ejercicio[] = [];
  nuevoEjercicio: Ejercicio = { nombre: '', descripcion: '', tipo: '' };
  enEdicion: Ejercicio | null = null;
  cargando = false;
  guardando = false;
  mensajeError = '';

  imagenSeleccionada: File | null = null;
  vistaPrevia: string | null = null;

  constructor(private ejercicioService: EjercicioService) {}

  ngOnInit(): void {
    this.cargarEjercicios();
  }

  ngOnDestroy(): void {
    this.liberarVistaPrevia();
  }

  cargarEjercicios(): void {
    this.cargando = true;
    this.ejercicioService.obtenerEjercicios().subscribe({
      next: (data) => {
        this.ejercicios = data.results;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar ejercicios:', err);
        this.cargando = false;
      },
    });
  }

  seleccionarImagen(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.mensajeError = '';
    this.liberarVistaPrevia();
    this.imagenSeleccionada = null;

    if (!archivo) return;
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      this.mensajeError = 'La imagen debe ser JPG, PNG o WEBP.';
      this.limpiarInputImagen();
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO_IMAGEN) {
      this.mensajeError = 'La imagen no puede superar los 2 MB.';
      this.limpiarInputImagen();
      return;
    }

    this.imagenSeleccionada = archivo;
    this.vistaPrevia = URL.createObjectURL(archivo);
  }

  guardarEjercicio(): void {
    this.mensajeError = '';
    if (!this.nuevoEjercicio.nombre || !this.nuevoEjercicio.tipo) {
      this.mensajeError = 'Por favor completa los campos obligatorios.';
      return;
    }

    const guardado$: Observable<Ejercicio> = this.enEdicion
      ? this.ejercicioService.actualizarEjercicio(this.enEdicion.id!, this.nuevoEjercicio)
      : this.ejercicioService.crearEjercicio(this.nuevoEjercicio);
    const imagen = this.imagenSeleccionada;

    this.guardando = true;
    guardado$
      .pipe(
        // Si se eligió una imagen, se sube después de guardar (hace falta el id del ejercicio).
        switchMap((ejercicio) =>
          imagen ? this.ejercicioService.subirImagen(ejercicio.id!, imagen) : of(ejercicio),
        ),
      )
      .subscribe({
        next: () => {
          this.guardando = false;
          this.resetFormulario();
          this.cargarEjercicios();
        },
        error: (err: HttpErrorResponse) => {
          this.guardando = false;
          this.mensajeError = this.mensajeDeError(err, 'No se pudo guardar el ejercicio.');
          this.cargarEjercicios(); // el ejercicio pudo guardarse aunque falle la imagen
        },
      });
  }

  quitarImagen(): void {
    const id = this.enEdicion?.id;
    if (!id || !confirm('¿Quitar la imagen de este ejercicio?')) return;

    this.ejercicioService.eliminarImagen(id).subscribe({
      next: () => {
        this.enEdicion = { ...this.enEdicion!, imagen_url: null };
        this.cargarEjercicios();
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeError = this.mensajeDeError(err, 'No se pudo quitar la imagen.');
      },
    });
  }

  editarEjercicio(ejercicio: Ejercicio): void {
    this.resetFormulario();
    this.enEdicion = { ...ejercicio };
    this.nuevoEjercicio = { ...ejercicio };
  }

  eliminarEjercicio(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este ejercicio?')) {
      this.ejercicioService.eliminarEjercicio(id).subscribe({
        next: () => this.cargarEjercicios(),
        error: (err) => console.error('Error al eliminar:', err),
      });
    }
  }

  resetFormulario(): void {
    this.enEdicion = null;
    this.nuevoEjercicio = { nombre: '', descripcion: '', tipo: '' };
    this.mensajeError = '';
    this.imagenSeleccionada = null;
    this.liberarVistaPrevia();
    this.limpiarInputImagen();
  }

  private liberarVistaPrevia(): void {
    if (this.vistaPrevia) {
      URL.revokeObjectURL(this.vistaPrevia);
      this.vistaPrevia = null;
    }
  }

  private limpiarInputImagen(): void {
    if (this.inputImagen) this.inputImagen.nativeElement.value = '';
  }

  private mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
    const cuerpo = err.error;
    if (cuerpo && typeof cuerpo === 'object') {
      const primero = Object.values(cuerpo)[0];
      const texto = Array.isArray(primero) ? primero[0] : primero;
      if (typeof texto === 'string') return texto;
    }
    return porDefecto;
  }
}