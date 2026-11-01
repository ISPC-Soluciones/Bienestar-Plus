import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './carousel.html',
  styleUrls: [],
})
export class Carousel implements OnInit, OnDestroy {
  currentIndex = 0;
  slides = [
    {
      imagen: 'assets/mujer_bebiendo_agua.jpg',
      alt: 'Mujer Saludable bebiendo agua',
      titulo:
        'El camino hacia una vida más <span class="text-[var(--primario)]">saludable</span> comienza aquí',
      descripcion: '¿Querés mejorar tus hábitos?',
      botonTexto: 'Regístrate',
    },
    {
      imagen: 'assets/hombre_corriendo.jpg',
      alt: 'Hombre haciendo ejercicio',
      titulo:
        'Transforma tu rutina, <span class="text-[var(--primario)]">transforma tu vida</span>',
      descripcion: 'Empieza hoy a construir hábitos duraderos.',
      botonTexto: 'Comenzar',
    },
    {
      imagen: 'assets/comida_saludable_home.jpg',
      alt: 'Comida saludable',
      titulo:
        'Nutre tu cuerpo, <span class="text-[var(--primario)]">nutre tu mente</span>',
      descripcion: 'Descubre el poder de una alimentación consciente.',
      botonTexto: 'Explorar',
    },
  ];

  private intervalId: any;

  ngOnInit() {
    this.iniciarAutoplay();
  }

  ngOnDestroy() {
    this.detenerAutoplay();
  }

  iniciarAutoplay() {
    this.intervalId = setInterval(() => {
      this.siguienteSlide();
    }, 5000); // Rota cada 5 segundos
  }

  detenerAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  siguienteSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  slideAnterior() {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  irASlide(index: number) {
    this.currentIndex = index;
  }
}
