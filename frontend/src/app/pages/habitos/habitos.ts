import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HabitosService } from '../../services/habitos';
import { ProgresoService, ProgresoDiario } from '../../services/progreso';
import { Habito } from '../../models/habito.model';

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './habitos.html',
  styleUrls: ['./habitos.css'],
})
export class Habitos implements OnInit {

  activeTab: string = 'ejercicio';
  habitos: Habito[] = [];
  mostrarRutina: boolean = false;
  habitoEnEdicion: Habito | null = null;
  progresosDiarios: ProgresoDiario[] = [];
  usuarioIdAutenticado: number = 1;

  constructor(
    private habitosService: HabitosService,
    private progresoService: ProgresoService
  ) {}

  ngOnInit(): void {
    this.cargarHabitos();
    this.cargarChecklistDiario();
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  toggleRutina(): void {
    this.mostrarRutina = !this.mostrarRutina;
  }

  cargarHabitos(): void {
    console.log('Cargando hábitos...');
    this.habitosService.getHabitos().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.habitos = data;
      },
      error: (err) => console.error('Error cargando hábitos:', err),
    });
  }

  /*  cargarHabitos(): void {
        console.log('Cargando hábitos de prueba (Modo DEV)...');
        
        // --- DATOS DE PRUEBA MANUALES ---
        const datosPrueba: Habito[] = [
            {
                id: 1, 
                nombre: 'Flexiones', 
                tipo: 'Ejercicio', 
                metaDiaria: '100 repeticiones', 
                frecuenciaSemanal: 7, 
                activo: true, 
                completado: true // Para probar el cambio de color
            },
            {
                id: 2, 
                nombre: 'Abdominales', 
                tipo: 'Ejercicio', 
                metaDiaria: '100 repeticiones', 
                frecuenciaSemanal: 7, 
                activo: true, 
                completado: false // Para probar el estado pendiente
            },

        ];
        
        this.habitos = datosPrueba;
        console.log('Hábitos de prueba cargados:', this.habitos);
        
        // Lógica de progreso (para mostrar "X de Y completados")
        // this.actualizarContadorProgreso(); 
        // Si no tienes esa función, déjala comentada por ahora.
    } */

  agregarHabito(
    tipo: string,
    nombre: string,
    metaDiaria: string,
    frecuenciaSemanal: number
  ): void {
    const nuevoHabito: Habito = {
      tipo,
      nombre,
      metaDiaria,
      frecuenciaSemanal,
      activo: true,
      completado: false,
    };

    this.habitosService.createHabito(nuevoHabito).subscribe({
      next: (habito) => {
        console.log('Hábito creado:', habito);
        this.habitos.push(habito);
      },
      error: (err) => console.error('Error creando hábito:', err),
    });
  }

  entrarEnModoEdicion(habito: Habito): void {
    this.habitoEnEdicion = { ...habito }; // Crear una COPIA del objeto para no modificar el original directamente
  }

  guardarEdicion(): void {
    if (this.habitoEnEdicion) {
      this.habitosService.updateHabito(this.habitoEnEdicion).subscribe({
        next: (habitoActualizado) => {
          console.log('Hábito actualizado:', habitoActualizado);
          // Actualizamos la lista local
          const index = this.habitos.findIndex(
            (h) => h.id === habitoActualizado.id
          );
          if (index !== -1) {
            this.habitos[index] = habitoActualizado;
          }
          this.habitoEnEdicion = null; // Salimos del modo edición
        },
        error: (err) => console.error('Error actualizando hábito:', err),
      });
    }
  }

  cancelarEdicion(): void {
    this.habitoEnEdicion = null; // Salimos del modo edición sin guardar
  }

  eliminarHabito(id?: number): void {
    if (id) {
      this.habitosService.deleteHabito(id).subscribe({
        next: () => {
          console.log('Hábito eliminado');
          this.habitos = this.habitos.filter((h) => h.id !== id);
        },
        error: (err) => console.error('Error eliminando hábito:', err),
      });
    }
  }

  cargarChecklistDiario(): void {
    console.log('Cargando checklist diario...');
    // Llamar al nuevo método con el usuario ID (obtenido de tu sistema de auth)
    this.progresoService.obtenerChecklist().subscribe({
      next: (data) => {
        console.log('Checklist recibido:', data);
        // La respuesta es la lista de ProgresoDiario
        this.progresosDiarios = data;
      },
      error: (err) => console.error('Error cargando checklist diario:', err),
    });
  }

  marcarHabito(progreso: ProgresoDiario): void {
    const nuevoEstado = progreso.completado; // El estado ya está en el modelo debido al [(ngModel)]

    // Llama al servicio para persistir el cambio
    this.progresoService.toggleCompletado(progreso.id, nuevoEstado).subscribe({
      next: (data) => {
        console.log('Progreso actualizado en el backend:', data);
        // Opcional: El progreso en la lista ya está actualizado gracias al [(ngModel)]
      },
      error: (err) => {
        console.error('Error al marcar hábito como completado:', err);
        // Rollback: Revertir el estado si la llamada falla
        progreso.completado = !nuevoEstado;
        // Mostrar un mensaje de error al usuario
      },
    });
  }
}
