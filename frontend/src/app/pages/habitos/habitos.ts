import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HabitosService } from '../../services/habitos'; 
import { Habito } from '../../models/habito.model';

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './habitos.html',
  styleUrls: ['./habitos.css'],
})
export class Habitos implements OnInit {
  activeTab: string = 'ejercicio';
  habitos: Habito[] = [];

  constructor(private habitosService: HabitosService) {}

  ngOnInit(): void {
    this.cargarHabitos();
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
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

  agregarHabito(): void {
    const nuevoHabito: Habito = {
      nombre: 'Leer 20 min',
      tipo: 'Desarrollo personal',
      metaDiaria: '20 minutos',
      frecuenciaSemanal: 7,
      activo: true,
    };

    this.habitosService.createHabito(nuevoHabito).subscribe({
      next: (habito) => {
        console.log('Hábito creado:', habito);
        this.habitos.push(habito); // actualiza la lista
      },
      error: (err) => console.error('Error creando hábito:', err),
    });
  }
}
