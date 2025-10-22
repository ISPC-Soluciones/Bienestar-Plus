import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EjercicioService } from '../../services/ejercicio'; 
import { RutinaEjercicioService } from '../../services/rutina-ejercicio'; 
import { Ejercicio, RutinaEjercicio } from '../../models/ejercicio'; 

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './habitos.html',
  styleUrls: ['./habitos.css'],
  providers: [EjercicioService, RutinaEjercicioService]
})
export class Habitos implements OnInit {

  activeTab: string = 'ejercicio';
  ejerciciosDisponibles: Ejercicio[] = []; 
  rutinaDelUsuario: RutinaEjercicio[] = []; 
  
  // Almacena el ID del registro de rutina que se está editando
  rutinaIdEnEdicion: number | null = null; 
  // Almacena temporalmente la nueva cantidad durante la edición
  cantidadEnEdicion: number | undefined; 

  usuarioNombre: string = 'Cosme'; 
  usuarioIdAutenticado: number = 1; 

  constructor(
    private ejercicioService: EjercicioService,
    private rutinaService: RutinaEjercicioService
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
  this.rutinaService.obtenerRutinaDelUsuario(this.usuarioIdAutenticado).subscribe({
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
  return this.rutinaDelUsuario.some(r => r.ejercicio === ejercicio.id);
}


  agregarEjercicioARutina(ejercicio: Ejercicio): void {
    if (!ejercicio.id || this.estaEnRutina(ejercicio)) return;

    // Usamos 20 como meta por defecto para que la edición tenga sentido
    const metaPorDefecto = 20; 

    this.rutinaService.agregarARutina(
        this.usuarioIdAutenticado, 
        ejercicio.id, 
        metaPorDefecto 
    ).subscribe({
      next: () => {
        // Operación silenciosa
        this.cargarRutinaDelUsuario(); 
      },
      error: (err) => {
        console.error('Error agregando ejercicio a la rutina:', err);
      },
    });
  }
  
  // =========================================================
  // LÓGICA DE GESTIÓN DE RUTINA (CRUD - Actualización/Eliminación/Check)
  // =========================================================

  /**
   * Habilita el modo de edición para un registro de rutina.
   */
  entrarEnModoEdicion(rutina: RutinaEjercicio): void {
    if (!rutina.id || rutina.completado) return;
    this.rutinaIdEnEdicion = rutina.id;
    this.cantidadEnEdicion = rutina.meta_cantidad; // Carga el valor actual
  }

  /**
   * Sale del modo de edición.
   */
  cancelarEdicion(): void {
    this.rutinaIdEnEdicion = null;
    this.cantidadEnEdicion = undefined;
  }

  /**
   * Guarda la nueva meta (cantidad) usando PATCH.
   */
  guardarEdicion(rutina: RutinaEjercicio): void {
    if (!rutina.id || this.cantidadEnEdicion === undefined || this.cantidadEnEdicion <= 0) {
        console.error("La cantidad debe ser un número positivo.");
        return;
    }
    
    const nuevaCantidad = this.cantidadEnEdicion;

    // Llama al PATCH endpoint de Django
    this.rutinaService.actualizarRutina(rutina.id, { meta_cantidad: nuevaCantidad }).subscribe({
        next: (rutinaActualizada) => {
            // Actualiza el objeto en la lista localmente
            rutina.meta_cantidad = rutinaActualizada.meta_cantidad; 
            // Operación silenciosa
            this.cancelarEdicion();
        },
        error: (err) => console.error('Error al actualizar la meta:', err)
    });
  }

  /**
   * Elimina un registro de rutina de la base de datos (DELETE).
   * CORREGIDO: Se quita la ventana emergente de confirmación.
   */
  eliminarRutina(id?: number): void {
    if (!id) return;
    
    // ELIMINADO: window.confirm()

    // Llama al DELETE endpoint de Django
    this.rutinaService.eliminarRutina(id).subscribe({
        next: () => {
            // Elimina el elemento de la lista local
            this.rutinaDelUsuario = this.rutinaDelUsuario.filter(r => r.id !== id);
        },
        error: (err) => console.error('Error al eliminar el ejercicio:', err)
    });
  }

  /**
   * Marca o desmarca un ejercicio como completado (PATCH).
   */
  marcarCompletado(rutina: RutinaEjercicio): void {
    // Si ya está completado, no se hace nada, el botón está oculto en el HTML
    if (!rutina.id || rutina.completado) return; 

    // Solo marcamos como TRUE
    const nuevoEstado = true; 
    
    // Llama al PATCH endpoint de Django para actualizar el estado
    this.rutinaService.actualizarRutina(rutina.id, { completado: nuevoEstado }).subscribe({
        next: (rutinaActualizada) => {
            // Actualiza el estado localmente
            rutina.completado = rutinaActualizada.completado;
            // Desactivamos el modo edición si estaba activo
            this.cancelarEdicion();
        },
        error: (err) => console.error('Error al marcar como completado:', err)
    });
  }
}

