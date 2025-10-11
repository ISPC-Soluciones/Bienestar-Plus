import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HabitosService } from '../../services/habitos';
import { Habito } from '../../models/habito.model';

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './habitos.html',
  styleUrls: ['./habitos.css'],
})
export class Habitos implements OnInit {
marcarHabito(_t39: Habito) {
throw new Error('Method not implemented.');
}
  activeTab: string = 'ejercicio';
  habitos: Habito[] = [];
  mostrarRutina: boolean = false;
  habitoEnEdicion: Habito | null = null;

  constructor(private habitosService: HabitosService) {}

  ngOnInit(): void {
    this.cargarHabitos();
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
          const index = this.habitos.findIndex(h => h.id === habitoActualizado.id);
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
          this.habitos = this.habitos.filter(h => h.id !== id);
        },
        error: (err) => console.error('Error eliminando hábito:', err),
      });
    }
  }
}