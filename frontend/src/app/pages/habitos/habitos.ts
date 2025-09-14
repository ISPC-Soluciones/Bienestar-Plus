import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HabitosService } from '../../services/habitos'; 
import { Habito } from '../../models/habito.model';

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habitos.html',
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