import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EjercicioService } from '../../../services/ejercicio';
import { Ejercicio } from '../../../models/ejercicio';

@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ejercicios.html',
  styleUrl: './ejercicios.css',
})
export class Ejercicios implements OnInit {
  ejercicios: Ejercicio[] = [];
  nuevoEjercicio: Ejercicio = { nombre: '', descripcion: '', tipo: '' };
  enEdicion: Ejercicio | null = null;
  cargando = false;
  mensajeError = '';

  constructor(private ejercicioService: EjercicioService) {}

  ngOnInit(): void {
    this.cargarEjercicios();
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

  guardarEjercicio(): void {
    this.mensajeError = '';
    if (!this.nuevoEjercicio.nombre || !this.nuevoEjercicio.tipo) {
      this.mensajeError = 'Por favor completa los campos obligatorios.';
      return;
    }

    if (this.enEdicion) {
      this.ejercicioService
        .actualizarEjercicio(this.enEdicion.id!, this.nuevoEjercicio)
        .subscribe({
          next: () => {
            this.resetFormulario();
            this.cargarEjercicios();
          },
          error: (err) => console.error('Error al actualizar:', err),
        });
    } else {
      this.ejercicioService.crearEjercicio(this.nuevoEjercicio).subscribe({
        next: () => {
          this.resetFormulario();
          this.cargarEjercicios();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          this.mensajeError = 'No se pudo crear el ejercicio.';
        },
      });
    }
  }

  editarEjercicio(ejercicio: Ejercicio): void {
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
  }
}
