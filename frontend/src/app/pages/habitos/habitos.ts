// src/app/pages/habitos/habitos.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitosService, ProgresoDiario, Ejercicio } from '../../services/habitos';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
      }
    });
  }

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
  marcarProgresoDiario(progreso: any) {
   
    console.log('Progreso diario marcado:', progreso);
  }
}
