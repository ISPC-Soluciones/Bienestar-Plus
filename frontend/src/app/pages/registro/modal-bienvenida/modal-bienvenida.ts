import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-bienvenida',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-bienvenida.html',
  styleUrl: './modal-bienvenida.css',
})
export class ModalBienvenida {
  @Input() recomendacion: string | null = null;

  @Output() cerrar = new EventEmitter<void>();

  constructor() {}

  cerrarModal(): void {
    this.cerrar.emit();
  }
}
