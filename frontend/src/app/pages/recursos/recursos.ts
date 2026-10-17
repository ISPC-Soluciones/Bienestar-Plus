import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecursosService } from '../../services/recursos.service';
import { Recurso } from '../../models/recurso.model';

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recursos.html',
  styleUrl: './recursos.css'
})
export class RecursosComponent implements OnInit {
  recursos: Recurso[] = [];
  recursosFiltrados: Recurso[] = [];
  cargando = true;
  filtroTipo = 'Todos';
  terminoBusqueda = '';
  tiposDisponibles: string[] = ['Todos', 'Bienestar Psicológico', 'Material de Apoyo'];

  constructor(private recursosService: RecursosService) {}

  ngOnInit(): void {
    this.cargarRecursos();
  }

  cargarRecursos(): void {
    this.cargando = true;
    this.recursosService.getRecursos().subscribe({
      next: (data) => {
        this.recursos = data || [];
        this.actualizarTiposDisponibles();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.recursos = [];
        this.recursosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  actualizarTiposDisponibles(): void {
    const tipos = new Set<string>();
    tipos.add('Todos');
    this.recursos.forEach((r) => {
      if (r.tipo && r.tipo.trim()) {
        tipos.add(r.tipo.trim());
      }
    });
    this.tiposDisponibles = Array.from(tipos);
  }

  cambiarFiltro(tipo: string): void {
    this.filtroTipo = tipo;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let resultado = [...this.recursos];

    if (this.filtroTipo && this.filtroTipo.toLowerCase() !== 'todos') {
      resultado = resultado.filter(
        (r) => r.tipo?.toLowerCase() === this.filtroTipo.toLowerCase()
      );
    }

    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      resultado = resultado.filter(
        (r) =>
          r.descripcion?.toLowerCase().includes(termino) ||
          r.tipo?.toLowerCase().includes(termino)
      );
    }

    this.recursosFiltrados = resultado;
  }

  tieneEnlace(enlace?: string): boolean {
    return !!(enlace && enlace.trim() !== '');
  }

  obtenerIconoTipo(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('psicológico') || t.includes('mental')) {
      return '🧠';
    }
    if (t.includes('apoyo') || t.includes('ayuda') || t.includes('contacto')) {
      return '🤝';
    }
    if (t.includes('mindfulness') || t.includes('meditación') || t.includes('respiración')) {
      return '🌿';
    }
    return '📘';
  }
}
