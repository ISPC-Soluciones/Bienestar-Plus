// ==========================================================
// src/app/pages/habitos/habitos.component.ts (INTEGRADO Y CORREGIDO)
// ==========================================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Importamos Rutina y Ejercicio del servicio de Rutina
import { RutinaEjercicioService,RutinaEjercicio,Ejercicio } from '../../services/rutina-ejercicio'; 

// Importamos ProgresoDiario y ProgresoService
import { ProgresoService,ProgresoDiario } from '../../services/progreso';



@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habitos.html', // Usamos la ruta simplificada que elegiste
  styleUrls: ['./habitos.css']
})
export class HabitosComponent implements OnInit {
  activeTab = 'ejercicio';
  mostrarRutina = false;
  usuarioIdAutenticado = 1;

  ejerciciosDisponibles: Ejercicio[] = [];
  rutinaUsuario: RutinaEjercicio[] = [];
  progresosDiarios: ProgresoDiario[] = []; // Para el checklist de Progreso

  private rutinaService = inject(RutinaEjercicioService);
  private progresoService = inject(ProgresoService); // Nuevo servicio inyectado

  ngOnInit(): void {
    this.cargarEjercicios();
    this.cargarRutina();
    this.cargarProgresoDiario(); // Nueva llamada para cargar el checklist
  }

  // --- MÉTODOS DE PROGRESO DIARIO (CHECKLIST) ---
  cargarProgresoDiario(): void {
    this.progresoService.getProgresoDiario(this.usuarioIdAutenticado).subscribe({
      next: (data: ProgresoDiario[]) => (this.progresosDiarios = data),
      error: (err: any) => console.error('Error cargando checklist diario:', err) // 💡 CORRECCIÓN TS7006
    });
  }

  marcarProgresoDiario(progreso: ProgresoDiario): void {
    this.progresoService.actualizarProgreso(progreso.id, progreso.completado).subscribe({
        next: () => console.log('Progreso de hábito actualizado.'),
        error: (err: any) => { // 💡 CORRECCIÓN TS7006
            console.error('Error al actualizar progreso:', err);
            progreso.completado = !progreso.completado; // Rollback
        }
    });
  }

  // --- MÉTODOS DE RUTINA DE EJERCICIOS ---
  cargarEjercicios(): void {
    this.rutinaService.obtenerEjercicios().subscribe({
      next: (data: Ejercicio[]) => (this.ejerciciosDisponibles = data),
      error: (err: any) => console.error('Error cargando ejercicios:', err) // 💡 CORRECCIÓN TS7006
    });
  }

  cargarRutina(): void {
    this.rutinaService.obtenerRutina(this.usuarioIdAutenticado).subscribe({
      next: (data: RutinaEjercicio[]) => (this.rutinaUsuario = data),
      error: (err: any) => console.error('Error cargando rutina:', err) // 💡 CORRECCIÓN TS7006
    });
  }

  agregarEjercicio(ejercicio: Ejercicio): void {
    this.rutinaService.agregarEjercicio(this.usuarioIdAutenticado, ejercicio.id).subscribe({
      next: (nuevo: RutinaEjercicio) => {
        this.rutinaUsuario.push(nuevo);
        alert(`Ejercicio "${ejercicio.nombre}" agregado a la rutina.`);
      },
      error: (err: any) => console.error('Error agregando ejercicio:', err) // 💡 CORRECCIÓN TS7006
    });
  }

  eliminarDeRutina(rutina: RutinaEjercicio): void {
    if (!rutina) return;
    const rutinaId = rutina.id;
    
    if (confirm('¿Deseas eliminar este ejercicio de tu rutina?')) {
      this.rutinaService.eliminarDeRutina(rutinaId).subscribe({
        next: () => {
            this.rutinaUsuario = this.rutinaUsuario.filter(r => r.id !== rutinaId);
            alert('Ejercicio eliminado de la rutina.');
        },
        error: (err: any) => console.error('Error eliminando ejercicio:', err) // 💡 CORRECCIÓN TS7006
      });
    }
  }

  marcarCompletado(rutina: RutinaEjercicio): void {
    this.rutinaService.toggleCompletado(rutina.id, rutina.completado).subscribe({
      next: () => console.log('Completado actualizado.'),
      error: (err: any) => { // 💡 CORRECCIÓN TS7006
        console.error('Error actualizando estado:', err);
        rutina.completado = !rutina.completado; // rollback
      }
    });
  }

  // --- MÉTODOS DE UI ---

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleRutina(): void {
    this.mostrarRutina = !this.mostrarRutina;
  }

  estaEnRutina(ejercicio: Ejercicio): boolean {
    return this.rutinaUsuario.some(r => r.ejercicio.id === ejercicio.id);
  }

  getRutinaPorEjercicio(ejercicioId: number): RutinaEjercicio | undefined {
    return this.rutinaUsuario.find(r => r.ejercicio.id === ejercicioId);
  }
}