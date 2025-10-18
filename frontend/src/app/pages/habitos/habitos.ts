<<<<<<< HEAD
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


=======
// src/app/pages/habitos/habitos.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitosService, ProgresoDiario, Ejercicio } from '../../services/habitos';
import { HttpClient } from '@angular/common/http';
>>>>>>> 29fffd37c685ccac3aa7fea2c2e00c380462872b

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, FormsModule],
<<<<<<< HEAD
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
=======
  templateUrl: './habitos.html',
  styleUrls: ['./habitos.css']
})
export class HabitosComponent implements OnInit {
  progresos: ProgresoDiario[] = [];
  ejercicios: Ejercicio[] = [];
  cargando = true;
  error = '';
  usuarioId: number | null = null; // lo obtendrás del estado de sesión / localStorage

  constructor(private habitosService: HabitosService, private http: HttpClient) {}

  ngOnInit(): void {
    // Ejemplo: obtén el usuario logueado desde localStorage (ajusta según tu auth)
    const user = localStorage.getItem('usuario'); // puede ser JSON string con id
    if (user) {
      try {
        const u = JSON.parse(user);
        this.usuarioId = u.id ?? null;
      } catch {
        this.usuarioId = null;
      }
    }

    if (!this.usuarioId) {
      // Si no tienes usuario en localStorage quizás lo tengas en otro servicio; adapta según tu app
      this.error = 'Usuario no identificado. Inicia sesión para ver tus hábitos.';
      this.cargando = false;
      return;
    }

    this.cargarChecklist();
    this.cargarEjercicios();
    this.cargarProgresos();
  }

  cargarChecklist(): void {
    if (!this.usuarioId) return;
    this.cargando = true;
    this.error = '';

    // No pasamos fecha: backend usará timezone.localdate() si no se envía
    this.habitosService.obtenerChecklist(this.usuarioId).subscribe({
      next: (data) => {
        this.progresos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar checklist:', err);
        this.error = 'No se pudieron cargar los hábitos. Reintenta más tarde.';
        this.cargando = false;
>>>>>>> 29fffd37c685ccac3aa7fea2c2e00c380462872b
      }
    });
  }

<<<<<<< HEAD
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
=======
  cargarProgresos() {
    if (!this.usuarioId) return;

    this.cargando = true;
    this.habitosService.obtenerProgresos(this.usuarioId).subscribe({
      next: (data) => {
        this.progresos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar hábitos';
        this.cargando = false;
      },
    });
  }

  cargarEjercicios() {
    this.habitosService.obtenerEjercicios().subscribe({
      next: (data: any) => {
        this.ejercicios = data.results ?? data; // ✅ maneja ambos casos
        console.log('📦 Ejercicios cargados:', this.ejercicios);
      },
      error: (err) => {
        console.error('Error al cargar ejercicios:', err);
        this.error = 'Error al cargar ejercicios';
      },
    });
  }

  agregarEjercicio(e: Ejercicio) {
    if (!this.usuarioId) return;
  
    this.habitosService.agregarEjercicioAChecklist(e.id).subscribe({
      next: (progreso) => {
        this.progresos.push(progreso); // se agrega a la lista de checkboxes
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo agregar el ejercicio a tu checklist');
      }
    });
  }
  
  quitarEjercicio(progreso: ProgresoDiario) {
    this.habitosService.quitarProgreso(progreso.id).subscribe({
      next: () => {
        this.progresos = this.progresos.filter(p => p.id !== progreso.id);
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo eliminar el ejercicio de tu checklist');
      }
    });
  }

  /**
   * Llama al endpoint POST toggle (no necesita payload según el viewset).
   * Actualiza el estado local inmediatamente si la llamada es exitosa.
   */
  alternarCompletado(progreso: ProgresoDiario): void {
    const id = progreso.id;
    // Feedback inmediato opcional:
    const estadoPrevio = progreso.completado;
    progreso.completado = !estadoPrevio;

    this.habitosService.toggleCompletado(id).subscribe({
      next: (resp) => {
        // Si tu backend devuelve el objeto o {id, completado}, intenta usarlo
        if (resp && typeof resp.completado === 'boolean') {
          progreso.completado = resp.completado;
        } else if (resp && resp.id && resp.id === id && typeof resp.completado === 'boolean') {
          progreso.completado = resp.completado;
        } else {
          // Si backend no devuelve estado confiable, dejamos el cambio local
        }
      },
      error: (err) => {
        console.error('Error al alternar completado:', err);
        // revertir cambio visual si falla
        progreso.completado = estadoPrevio;
        alert('No se pudo actualizar el estado del hábito. Intenta nuevamente.');
      }
    });
  }
}
>>>>>>> 29fffd37c685ccac3aa7fea2c2e00c380462872b
