import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  usuario = {
    nombre: 'Cosme Fulanito',
    email: 'cosmefulanito@ispc.com.ar',
    progreso: '¡Felicidades has reducido tu estrés diario en un 50%!',
    foto: 'assets/usuario.jpg',
    grafico: 'assets/grafico_usuario_metricas.jpg',
  };
}
