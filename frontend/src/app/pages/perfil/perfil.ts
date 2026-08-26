import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
// Importaciones de Servicios y Modelos (Asumiendo que las rutas relativas son correctas)
import { PerfilService } from '../../services/perfil';
import { ProgresoService } from '../../services/progreso';
import { NotificacionesService } from '../../services/notificaciones';
import { Usuario, PerfilSalud } from '../../models/perfil.model'; 

import { Subject, of, switchMap, takeUntil } from 'rxjs';


@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './perfil.component.html', // Corregido el nombre del archivo
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit, OnDestroy {
  usuario?: Usuario; 
  loading = false;
  error = '';
  listaDeNotificaciones: any[] = [];
  modalAbierto = false;
  perfilForm: FormGroup;
  rutina: any[] = [];
  
  // PROPIEDAD PARA EL ARCHIVO
  fotoPerfilFile: File | null = null; 

  private destroy$ = new Subject<void>();

  constructor(
    private perfilService: PerfilService,
    private progresoService: ProgresoService,
    private route: ActivatedRoute,
    private notificacionesService: NotificacionesService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.perfilForm = this.fb.group({
      // Campos de PerfilSalud
      // Se usan patrones regex para permitir solo números y un punto decimal opcional (e.g., 75.50 o 175)
      peso: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]], 
      altura: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      genero: [''], 
      fecha_nacimiento: [''],
      
      // CAMPOS DE USUARIO PARA EDICIÓN
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loading = true;

    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        // Obtener ID de la URL o del localStorage
        switchMap((params: ParamMap) => {
          const idParam = params.get('id');
          const id = idParam ? Number(idParam) : undefined;

          if (id) {
            return this.perfilService.getUsuarioConHabitos(id);
          }
          const usuarioGuardado = localStorage.getItem('usuario');
          if (usuarioGuardado) {
            const idLocal = JSON.parse(usuarioGuardado).id;
            return this.perfilService.getUsuarioConHabitos(idLocal);
          }
          this.error = 'No se encontró información del usuario.';
          this.loading = false;
          // Retornar un observable de null para mantener el flujo
          return of(null as unknown as Usuario | undefined); 
        })
      )
      .subscribe({
        next: usuario => {
          if (usuario) { // Se verifica que no sea undefined
            this.usuario = usuario; 
            localStorage.setItem('usuario', JSON.stringify(usuario));
            this.cargarProgreso(Number(usuario.id)); 
          } 
          this.loading = false;
        },
        error: err => {
          console.error('[PerfilComponent] Error al cargar usuario:', err);
          this.error = 'Error al cargar usuario';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarFormulario(salud?: PerfilSalud) {
    // Usar la destructuración de PerfilSalud o un objeto vacío para evitar errores
    const dataToLoad = salud || ({} as PerfilSalud); 

    this.perfilForm.patchValue({
      // Datos de PerfilSalud
      // Conversión explícita para asegurar que los inputs de tipo number no reciban '' (vacío) sino null o el valor
      peso: dataToLoad.peso !== undefined && dataToLoad.peso !== null ? Number(dataToLoad.peso) : '',
      altura: dataToLoad.altura !== undefined && dataToLoad.altura !== null ? Number(dataToLoad.altura) : '',
      genero: dataToLoad.genero ?? '',
      
      // Conversión de fecha a string ISO (YYYY-MM-DD) para el input type="date"
      fecha_nacimiento: dataToLoad.fecha_nacimiento
        ? (new Date(dataToLoad.fecha_nacimiento).toISOString().substring(0, 10))
        : '',
      
      // Datos de Usuario
      nombre: this.usuario?.nombre || '',
      email: this.usuario?.email || ''
    });
  }

  abrirModal(): void {
    // Carga los datos actuales antes de abrir el modal
    this.cargarFormulario(this.usuario?.perfil_salud || ({} as PerfilSalud));
    this.modalAbierto = true;
    this.error = ''; // Limpiar errores previos
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.perfilForm.reset(); // Opcional: limpiar el formulario al cerrar
    this.fotoPerfilFile = null;
    this.error = '';
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fotoPerfilFile = input.files[0];
    } else {
      this.fotoPerfilFile = null;
    }
  }

  guardarPerfil(): void {
    if (!this.usuario || this.perfilForm.invalid) {
      console.warn('[PerfilComponent] guardarPerfil: Formulario o usuario inválido.');
      this.perfilForm.markAllAsTouched();
      this.error = 'Por favor, complete los campos de Nombre y Email obligatorios.';
      return;
    }

    const formValues = this.perfilForm.value;
    this.loading = true;
    this.error = '';

    // --- 1. Preparar los datos del PerfilSalud ---
    const perfilSaludData: Partial<PerfilSalud> = {};

    // Función auxiliar para obtener el valor o null si está vacío ('')
    const getValue = (value: any) => (value !== '' ? value : null);

    // Solo incluimos propiedades si tienen un valor definido y válido
    const pesoValue = getValue(formValues.peso);
    if (pesoValue !== null) {
        perfilSaludData.peso = Number(pesoValue);
    }
    
    const alturaValue = getValue(formValues.altura);
    if (alturaValue !== null) {
        perfilSaludData.altura = Number(alturaValue);
    }

    const generoValue = getValue(formValues.genero);
    if (generoValue !== null) {
        perfilSaludData.genero = generoValue;
    }

    const fechaNacimientoValue = getValue(formValues.fecha_nacimiento);
    if (fechaNacimientoValue !== null) {
        // Se envía el string de fecha (YYYY-MM-DD)
        perfilSaludData.fecha_nacimiento = fechaNacimientoValue; 
    }


    // --- 2. Preparar los datos del Usuario (con FormData para la imagen) ---
    const usuarioFormData = new FormData();
    usuarioFormData.append('nombre', formValues.nombre);
    usuarioFormData.append('email', formValues.email);
    
    if (this.fotoPerfilFile) {
        usuarioFormData.append('foto_perfil', this.fotoPerfilFile, this.fotoPerfilFile.name);
    }
    
    // Ejecutar ambas actualizaciones en secuencia: PerfilSalud -> Usuario -> Recarga
    this.perfilService.updatePerfilSalud(Number(this.usuario.id), perfilSaludData as Partial<PerfilSalud>).pipe(
      // Actualiza el usuario con FormData (incluye nombre, email, y opcionalmente foto)
      switchMap(() => this.perfilService.updateUsuario(Number(this.usuario!.id), usuarioFormData)),
      // Recarga el usuario completo para refrescar el perfil de salud, la URL de la foto y el IMC
      switchMap(() => this.perfilService.getUsuarioConHabitos(Number(this.usuario!.id))),
      takeUntil(this.destroy$)
    ).subscribe({
      next: usuarioActualizado => { 
        if (usuarioActualizado) { 
          this.usuario = usuarioActualizado; 
          localStorage.setItem('usuario', JSON.stringify(this.usuario));
          this.cerrarModal();
          this.fotoPerfilFile = null; // Limpiar la variable
        }
        this.loading = false;
      },
      error: err => {
        // Muestra el error de la API
        console.error('[PerfilComponent] Error actualizando perfil o usuario:', err);
        this.error = 'Hubo un error al actualizar el perfil. Por favor, revisa los datos y la imagen.';
        this.loading = false;
      }
    });
  }

  cargarProgreso(usuarioId: number): void {
    this.progresoService.getProgresoDiario(usuarioId).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        // Asume que 'res' es un array de ProgresoDiario
        this.rutina = res; 
      },
      error: err => {
        // Manejar el caso si no hay progreso o la API responde con error
        console.warn('[PerfilComponent] Error al obtener progreso diario:', err);
        this.rutina = []; // Mostrar 'No hay hábitos cargados'
      }
    });
  }

  get totalHabitos(): number {
    return this.rutina?.length ?? 0;
  }

  get habitosCompletados(): number {
    return this.rutina?.reduce((acc, r) => acc + (r.completado ? 1 : 0), 0) ?? 0;
  }

  get porcentajeCompletado(): number {
    // Evitar división por cero
    return this.totalHabitos ? (this.habitosCompletados / this.totalHabitos) * 100 : 0;
  }

  onCheckboxChange(event: Event, id: number): void {
    const target = event.target as HTMLInputElement;
    if (!target) return;
    this.marcarHabito(id, target.checked);
  }

  marcarHabito(id: number, completado: boolean): void {
    this.progresoService.marcarCompletado(id, completado).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // Actualización local optimista
        const progreso = this.rutina.find(r => r.id === id);
        if (progreso) {
          progreso.completado = completado;
        }
      },
      error: err => {
        console.error('[PerfilComponent] Error al actualizar hábito', err);
        // Opcional: Revertir el estado del checkbox si la actualización falla
      }
    });
  }
}
