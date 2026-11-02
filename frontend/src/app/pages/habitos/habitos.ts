import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EjercicioService } from '../../services/ejercicio';
import { RutinaEjercicioService } from '../../services/rutina-ejercicio';
import { Ejercicio, RutinaEjercicio } from '../../models/ejercicio';
import { EstadisticasService } from '../../services/estadisticas.service';
import { ProgresoService,ProgresoDiario,} from '../../services/progreso';
import { PlanNutricionalComponent } from '../plan-nutricional/plan-nutricional';
import { HidratacionService } from '../../services/hidratacion';
import { ResumenHidratacion,TipoHidratacion } from '../../models/hidratacion';

type HabitosTab = 'ejercicio' | 'hidratacion' | 'alimentacion' | 'sueno';
const HABITOS_TABS: readonly HabitosTab[] = [
  'ejercicio',
  'hidratacion',
  'alimentacion',
  'sueno',
];

function esHabitosTab(tab: string | null): tab is HabitosTab {
  return tab !== null && HABITOS_TABS.includes(tab as HabitosTab);
}

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, FormsModule, PlanNutricionalComponent],
  templateUrl: './habitos.html',
  styleUrls: ['./habitos.css'],
  providers: [EjercicioService, RutinaEjercicioService],
})
export class Habitos implements OnInit {
  activeTab: HabitosTab = 'ejercicio';
  ejerciciosDisponibles: Ejercicio[] = [];
  rutinaDelUsuario: RutinaEjercicio[] = [];
  ejerciciosAgregadosHoy = new Set<number>();
  mensajeRutina = '';
  readonly imagenPorDefecto = 'assets/ejercicio-sin-imagen.svg';
  progresoSueno: ProgresoDiario | null = null;
  horasSueno: number | null = null;
  cargandoSueno = false;
  errorSueno = '';
  
  
  private readonly hidratacionService = inject(HidratacionService);
  readonly opcionesHidratacion: {
    tipo: TipoHidratacion;
    nombre: string;
    cantidad: string;
  }[] = [
    { tipo: 'vaso', nombre: 'Vaso', cantidad: '250 ml' },
    { tipo: 'botella_500', nombre: 'Botella', cantidad: '500 ml' },
    { tipo: 'botella_1l', nombre: 'Botella', cantidad: '1 L' },
  ];
  readonly resumenHidratacion = signal<ResumenHidratacion | null>(null);
  readonly guardandoHidratacion = signal(false);
  readonly errorHidratacion = signal('');
  /** Porcentaje de la meta, tope 100 % para la barra. */
  readonly porcentajeHidratacion = computed(() => {
    const resumen = this.resumenHidratacion();
    if (!resumen || resumen.meta_ml === 0) return 0;
    return Math.min(100, (resumen.total_ml / resumen.meta_ml) * 100);
  });

  rutinaIdEnEdicion: number | null = null;

  cantidadEnEdicion: number | undefined;

  usuarioNombre: string = '';
  usuarioIdAutenticado: number = 0;

  constructor(
    private ejercicioService: EjercicioService,
    private rutinaService: RutinaEjercicioService,
    private estadisticasService: EstadisticasService,
    private progresoService: ProgresoService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const tabSolicitada = this.route.snapshot.queryParamMap.get('tab');
    if (esHabitosTab(tabSolicitada)) this.activeTab = tabSolicitada;

    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      this.usuarioNombre = usuario?.nombre ?? '';
      this.usuarioIdAutenticado = usuario?.id ?? 0;
    }

    this.cargarEjerciciosDisponibles();
    this.cargarRutinaDelUsuario();
    this.cargarProgresoSueno();
    this.cargarHidratacion();
  }

  setActiveTab(tabName: HabitosTab): void {
    this.activeTab = tabName;
  }

  cargarEjerciciosDisponibles(): void {
    this.ejercicioService.obtenerEjercicios().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.ejerciciosDisponibles = response;
        } else if (response && 'results' in response) {
          this.ejerciciosDisponibles = response.results;
        } else {
          this.ejerciciosDisponibles = [];
          console.warn('Formato inesperado de respuesta:', response);
        }
      },
      error: (err) => console.error('Error cargando ejercicios:', err),
    });
  }

  cargarRutinaDelUsuario(): void {
    this.rutinaService
      .obtenerRutinaDelUsuario(this.usuarioIdAutenticado)
      .subscribe({
        next: (rutina) => {
            this.establecerRutina(Array.isArray(rutina) ? rutina : rutina?.results ?? []);
          },
        error: (err: HttpErrorResponse) => {
            this.establecerRutina([]);
            this.mensajeRutina = this.mensajeDeError(err, 'No se pudo cargar tu rutina.');
          },
      });
  }

      estaEnRutina(ejercicio: Ejercicio): boolean {
      return ejercicio.id !== undefined && this.ejerciciosAgregadosHoy.has(ejercicio.id);
    }

    /** Actualiza la rutina y recalcula una sola vez qué ejercicios ya están agregados hoy. */
    usarImagenPorDefecto(evento: Event): void {
       const img = evento.target as HTMLImageElement;
       if (!img.src.endsWith(this.imagenPorDefecto)) {
         img.src = this.imagenPorDefecto;
       }
     }
     
    private establecerRutina(rutinas: RutinaEjercicio[]): void {
      this.rutinaDelUsuario = rutinas;
      // es_de_hoy lo calcula el backend: evita diferencias de zona horaria con el navegador.
      this.ejerciciosAgregadosHoy = new Set(
        rutinas.filter((r) => r.es_de_hoy).map((r) => r.ejercicio),
      );
    }

    /** Devuelve el primer mensaje de error que envía la API (DRF) o un texto por defecto. */
    private mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
      const cuerpo = err.error;
      if (cuerpo && typeof cuerpo === 'object') {
        const primero = Object.values(cuerpo)[0];
        const texto = Array.isArray(primero) ? primero[0] : primero;
        if (typeof texto === 'string') return texto;
      }
      return porDefecto;
    }

  agregarEjercicioARutina(ejercicio: Ejercicio): void {
    if (!ejercicio.id || this.estaEnRutina(ejercicio)) return;

    const metaPorDefecto = 20;
    this.mensajeRutina = '';

    this.rutinaService
      .agregarARutina(this.usuarioIdAutenticado, ejercicio.id, metaPorDefecto)
      .subscribe({
        next: (rutinaCreada) => {
            // La respuesta ya trae el id del ejercicio: se actualiza sin volver a pedir la rutina.
            this.establecerRutina([rutinaCreada, ...this.rutinaDelUsuario]);
            this.estadisticasService.emitirRefresco();
          },
        error: (err: HttpErrorResponse) => {
            this.mensajeRutina = this.mensajeDeError(err, 'No se pudo agregar el ejercicio.');
            if (err.status === 400) {
              this.cargarRutinaDelUsuario(); // sincroniza el botón si ya estaba agregado
            }
        },
      });
  }

  cargarProgresoSueno(): void {
    if (!this.usuarioIdAutenticado) {
      this.errorSueno = 'No se pudo identificar al usuario.';
      return;
    }
  
    this.cargandoSueno = true;
    this.errorSueno = '';
  
    this.progresoService
      .getProgresoDiario(this.usuarioIdAutenticado)
      .subscribe({
        next: (progresos) => {
          this.progresoSueno =
            progresos.find(
              (progreso) =>
                progreso.habito.nombre.toLowerCase() === 'horas de sueño',
            ) ?? null;
            if (this.progresoSueno && this.progresoSueno.valor !== null) {
              this.horasSueno = Number(this.progresoSueno.valor);
            } else {
              this.horasSueno = null;
            } 
  
          if (!this.progresoSueno) {
            this.errorSueno =
              'No se encontró el hábito de sueño para el día de hoy.';
          }
  
          this.cargandoSueno = false;
        },
        error: (err) => {
          console.error('Error cargando progreso de sueño:', err);
          this.errorSueno = 'No se pudo cargar el seguimiento de sueño.';
          this.cargandoSueno = false;
        },
      });
  }
  
  guardarHorasSueno(): void {
    if (!this.progresoSueno || this.horasSueno === null) {
      return;
    }
  
    this.cargandoSueno = true;
    this.errorSueno = '';
  
    this.progresoService
      .actualizarValor(this.progresoSueno.id, this.horasSueno)
      .subscribe({
        next: (progresoActualizado) => {
          this.progresoSueno = progresoActualizado;
  
          this.horasSueno =
            progresoActualizado.valor !== null
              ? Number(progresoActualizado.valor)
              : null;
  
          this.cargandoSueno = false;
  
          this.estadisticasService.emitirRefresco();
        },
        error: (err) => {
          console.error('Error guardando horas de sueño:', err);
  
          this.errorSueno =
            err?.error?.error ??
            'No se pudieron guardar las horas de sueño. Intentá nuevamente.';
  
          this.cargandoSueno = false;
        },
      });
  }

  // =========================================================
  // LÓGICA DE GESTIÓN DE RUTINA (CRUD - Actualización/Eliminación/Check)
  // =========================================================

  entrarEnModoEdicion(rutina: RutinaEjercicio): void {
    if (!rutina.id || rutina.completado) return;
    this.rutinaIdEnEdicion = rutina.id;
    this.cantidadEnEdicion = rutina.meta_cantidad;
  }

  cancelarEdicion(): void {
    this.rutinaIdEnEdicion = null;
    this.cantidadEnEdicion = undefined;
  }

  guardarEdicion(rutina: RutinaEjercicio): void {
    if (
      !rutina.id ||
      this.cantidadEnEdicion === undefined ||
      this.cantidadEnEdicion <= 0
    ) {
      this.mensajeRutina = 'La meta debe ser un número mayor que cero.';
      return;
    }

    const nuevaCantidad = this.cantidadEnEdicion;
    this.mensajeRutina = '';

    this.rutinaService
      .actualizarRutina(rutina.id, { meta_cantidad: nuevaCantidad })
      .subscribe({
        next: (rutinaActualizada) => {
          rutina.meta_cantidad = rutinaActualizada.meta_cantidad;
          this.cancelarEdicion();
        },
        error: (err: HttpErrorResponse) => {
          this.mensajeRutina = this.mensajeDeError(err, 'No se pudo actualizar la meta.');
        },
      });
  }

  eliminarRutina(id?: number): void {
    if (!id) return;

    this.rutinaService.eliminarRutina(id).subscribe({
      next: () => {
        this.establecerRutina(this.rutinaDelUsuario.filter((r) => r.id !== id));
      },
      error: (err: HttpErrorResponse) => {
        this.mensajeRutina = this.mensajeDeError(err, 'No se pudo eliminar el ejercicio.');
      },
    });
  }

  marcarCompletado(rutina: RutinaEjercicio): void {
    if (!rutina.id || rutina.completado) return;

    const nuevoEstado = true;

    this.rutinaService
      .actualizarRutina(rutina.id, { completado: nuevoEstado })
      .subscribe({
        next: (rutinaActualizada) => {
          rutina.completado = rutinaActualizada.completado;
          this.cancelarEdicion();
        },
        error: (err: HttpErrorResponse) => {
          this.mensajeRutina = this.mensajeDeError(err, 'No se pudo marcar como completado.');
        },
      });
  }

  // MÉTODO PARA DESCARGAR EL PDF DE LA RUTINA COMPLETA DEL USUARIO
  descargarPdf(): void {
    if (!this.usuarioIdAutenticado) {
      console.error('No hay un usuario autenticado para descargar la rutina.');
      return;
    }

    this.rutinaService.descargarPdfRutina(this.usuarioIdAutenticado).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rutina_completa_${this.usuarioIdAutenticado}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el PDF:', err);
        alert('No se pudo generar el PDF de la rutina.');
      },
    });
  }


  cargarHidratacion(): void {
    this.errorHidratacion.set('');
    this.hidratacionService.consultar().subscribe({
      next: (resumen) => this.resumenHidratacion.set(resumen),
      error: (err: HttpErrorResponse) =>
        this.errorHidratacion.set(this.mensajeErrorHidratacion(err)),
    });
  }

  agregarAgua(tipo: TipoHidratacion): void {
    this.guardandoHidratacion.set(true);
    this.errorHidratacion.set('');
    this.hidratacionService.agregar(tipo).subscribe({
      next: (resumen) => {
        this.resumenHidratacion.set(resumen);
        this.guardandoHidratacion.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorHidratacion.set(this.mensajeErrorHidratacion(err));
        this.guardandoHidratacion.set(false);
      },
    });
  }

  eliminarRegistroAgua(id: number): void {
    this.guardandoHidratacion.set(true);
    this.errorHidratacion.set('');
    this.hidratacionService.eliminar(id).subscribe({
      next: (resumen) => {
        this.resumenHidratacion.set(resumen);
        this.guardandoHidratacion.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorHidratacion.set(this.mensajeErrorHidratacion(err));
        this.guardandoHidratacion.set(false);
      },
    });
  }

  /** 1250 -> "1,25 L" */
  litros(ml: number): string {
    return `${(ml / 1000).toLocaleString('es-AR', { maximumFractionDigits: 2 })} L`;
  }

  private mensajeErrorHidratacion(err: HttpErrorResponse): string {
    if (err.status === 401 || err.status === 403) {
      return 'Tu sesión expiró. Volvé a iniciar sesión para registrar tu hidratación.';
    }
    return 'No se pudo actualizar tu hidratación. Intentá nuevamente.';
  }

}
