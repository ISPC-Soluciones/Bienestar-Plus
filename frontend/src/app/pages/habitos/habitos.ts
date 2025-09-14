import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
<<<<<<< HEAD
=======
import { HabitosService } from '../../services/habitos'; 
import { Habito } from '../../models/habito.model';
>>>>>>> 847bb8893a545e93cdd6f6a7a2997b1012db612a

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habitos.html',
<<<<<<< HEAD
  styleUrl: './habitos.css',
})
export class Habitos implements OnInit {
  activeTab: string = 'ejercicio';

  constructor() {}

  ngOnInit(): void {}
=======
  styleUrls: ['./habitos.css'],
})
export class Habitos implements OnInit {
  activeTab: string = 'ejercicio';
  habitos: Habito[] = [];
  mostrarRutina: boolean = false;

  constructor(private habitosService: HabitosService) {}

  ngOnInit(): void {
    this.cargarHabitos();
  }
>>>>>>> 847bb8893a545e93cdd6f6a7a2997b1012db612a

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }
<<<<<<< HEAD
}
=======

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

  agregarHabito(
    nombre: string,
    tipo: string,
    metaDiaria: string,
    frecuenciaSemanal: number
  ): void {
    const nuevoHabito: Habito = {
      nombre,
      tipo,
      metaDiaria,
      frecuenciaSemanal,
      activo: true,
    };

    this.habitosService.createHabito(nuevoHabito).subscribe({
      next: (habito) => {
        console.log('Hábito creado:', habito);
        this.habitos.push(habito);
      },
      error: (err) => console.error('Error creando hábito:', err),
    });
  }
}
>>>>>>> 847bb8893a545e93cdd6f6a7a2997b1012db612a
