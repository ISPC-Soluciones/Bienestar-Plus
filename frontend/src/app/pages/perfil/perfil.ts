import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ActivatedRoute,
  RouterModule,
  Router,
  ParamMap,
} from '@angular/router';
import { CommonModule } from '@angular/common';

import { Observable, Subject, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { PerfilService } from '../../services/perfil';
import { RutinaEjercicioService } from '../../services/rutina-ejercicio';
import { Notificacion } from '../../models/notificacion';
import { NotificacionesService } from '../../services/notificaciones';
import { Usuario, PerfilSalud } from '../../models/perfil.model';
import { ModalBienvenida } from '../registro/modal-bienvenida/modal-bienvenida';

import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ImageCropperComponent,
    ModalBienvenida,
  ],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class PerfilComponent implements OnInit, OnDestroy {
  usuario?: Usuario;
  loading = false;
  error = '';

  listaDeNotificaciones: Notificacion[] = [];
  modalAbierto = false;
  mostrarModalRecomendacion = false;
  recomendacionUsuario: string | null = null;

  perfilForm: FormGroup;

  rutina: any[] = [];

  fotoPerfilFile: File | null = null;

  // Recorte de la foto de perfil
  imagenParaRecortar: Event | null = null;
  fotoRecortadaBlob: Blob | null = null;
  previewRecorte: string | null = null;
  subiendoFoto = false;
  errorFoto = '';

  private destroy$ = new Subject<void>();

  constructor(
    private perfilService: PerfilService,
    private rutinaEjercicioService: RutinaEjercicioService,
    private route: ActivatedRoute,
    private notificacionesService: NotificacionesService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.perfilForm = this.fb.group({
      peso: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      altura: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      genero: [''],
      fecha_nacimiento: [''],

      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loading = true;

    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),

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

          return of(undefined);
        }),
      )
      .subscribe({
        next: (usuario) => {
          if (usuario) {
            this.usuario = usuario;
            localStorage.setItem('usuario', JSON.stringify(usuario));
            this.cargarProgreso(Number(usuario.id));
        
            const completarPerfil =
              this.route.snapshot.queryParamMap.get('completarPerfil');
        
            if (completarPerfil === 'true') {
              this.abrirModal();
            }
          }
        
          this.loading = false;
        },

        error: (err) => {
          console.error('[PerfilComponent] Error al cargar usuario:', err);

          this.error = 'Error al cargar usuario';
          this.loading = false;
        },
      });
  }

  private cargarPerfil(id: number): void {
    this.perfilService.getUsuarioConHabitos(id).subscribe({
      next: (usuarioData) => {
        if (!usuarioData) {
          this.error = 'No se pudo cargar el perfil.';
          this.loading = false;
          return;
        }

        this.usuario = usuarioData;

        const salud = usuarioData.perfil_salud;

        if (salud) {
          this.perfilForm.patchValue({
            peso: salud.peso ?? '',
            altura: salud.altura ? Number(salud.altura) * 100 : '',
            genero: salud.genero ?? '',
            fecha_nacimiento: salud.fecha_nacimiento
              ? new Date(salud.fecha_nacimiento).toISOString().substring(0, 10)
              : '',
          });
        }

        this.perfilForm.patchValue({
          nombre: usuarioData.nombre ?? '',
          email: usuarioData.email ?? '',
        });

        localStorage.setItem('usuario', JSON.stringify(this.usuario));

        this.loading = false;

        this.cargarProgreso(id);
      },

      error: (err) => {
        console.error('❌ Error cargando perfil:', err);

        this.error = 'No se pudo cargar el perfil.';
        this.loading = false;
      },
    });
  }

  abrirModal(): void {
    if (!this.usuario) {
      return;
    }

    const salud = this.usuario.perfil_salud;

    this.perfilForm.patchValue({
      peso: salud?.peso ?? '',

      altura: salud?.altura ? Number(salud.altura) * 100 : '',

      genero: salud?.genero ?? '',

      fecha_nacimiento: salud?.fecha_nacimiento
        ? new Date(salud.fecha_nacimiento).toISOString().substring(0, 10)
        : '',

      nombre: this.usuario.nombre ?? '',

      email: this.usuario.email ?? '',
    });

    this.modalAbierto = true;
    this.error = '';
  }

  cerrarModal(): void {
    this.modalAbierto = false;

    this.perfilForm.reset();

    this.fotoPerfilFile = null;
    this.imagenParaRecortar = null;
    this.fotoRecortadaBlob = null;
    this.previewRecorte = null;
    this.errorFoto = '';

    this.error = '';
  }
  cerrarModalRecomendacion(): void {
    this.mostrarModalRecomendacion = false;
  
    this.router.navigate(
      ['/perfil', this.usuario?.id],
      { replaceUrl: true }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.fotoPerfilFile = input.files[0];
      this.imagenParaRecortar = event;
      this.fotoRecortadaBlob = null;
      this.previewRecorte = null;
      this.errorFoto = '';
    } else {
      this.fotoPerfilFile = null;
      this.imagenParaRecortar = null;
    }
  }

  onImagenRecortada(evento: ImageCroppedEvent): void {
    if (evento.blob) {
      this.fotoRecortadaBlob = evento.blob;
      this.previewRecorte = evento.objectUrl ?? null;
    }
  }

  cancelarRecorte(): void {
    this.imagenParaRecortar = null;
    this.fotoRecortadaBlob = null;
    this.previewRecorte = null;
    this.fotoPerfilFile = null;
  }

  guardarFotoPerfil(): void {
    if (!this.usuario || !this.fotoRecortadaBlob) {
      return;
    }

    const confirmar = confirm('¿Confirmás guardar esta foto de perfil?');
    if (!confirmar) return;

    this.subiendoFoto = true;
    this.errorFoto = '';

    this.perfilService
      .subirFotoPerfil(Number(this.usuario.id), this.fotoRecortadaBlob)
      .subscribe({
        next: (respuesta) => {
          this.subiendoFoto = false;

          if (respuesta?.success && this.usuario) {
            // Se le agrega un parámetro con la hora actual para forzar
            // que el navegador pida la imagen de nuevo (evita que se
            // quede mostrando la foto vieja en caché).
            const urlActualizada = `${respuesta.foto_perfil_url}?t=${Date.now()}`;
            this.usuario = { ...this.usuario, foto_perfil_url: urlActualizada };
            localStorage.setItem('usuario', JSON.stringify(this.usuario));
            this.cancelarRecorte();
          } else {
            this.errorFoto = 'No se pudo guardar la foto. Intentá de nuevo.';
          }
        },
        error: () => {
          this.errorFoto = 'No se pudo guardar la foto. Intentá de nuevo.';
          this.subiendoFoto = false;
        },
      });
  }

  guardarPerfil(): void {
    if (!this.usuario || this.perfilForm.invalid) {
      console.warn(
        '[PerfilComponent] guardarPerfil: Formulario o usuario inválido.',
      );

      this.perfilForm.markAllAsTouched();

      this.error =
        'Por favor, complete los campos de Nombre y Email obligatorios.';

      return;
    }

    const formValues = this.perfilForm.value;

    this.loading = true;
    this.error = '';

    // Datos del perfil de salud
    const perfilSaludData: Partial<PerfilSalud> = {};

    if (
      formValues.peso !== null &&
      formValues.peso !== undefined &&
      formValues.peso !== ''
    ) {
      perfilSaludData.peso = Number(formValues.peso);
    }

    if (
      formValues.altura !== null &&
      formValues.altura !== undefined &&
      formValues.altura !== ''
    ) {
// El formulario recibe centímetros.
// El backend guarda metros.
perfilSaludData.altura = Number(formValues.altura) / 100;
    }

    if (formValues.genero !== null && formValues.genero !== undefined) {
      perfilSaludData.genero = formValues.genero;
    }

    if (
      formValues.fecha_nacimiento !== null &&
      formValues.fecha_nacimiento !== undefined &&
      formValues.fecha_nacimiento !== ''
    ) {
      perfilSaludData.fecha_nacimiento = new Date(formValues.fecha_nacimiento)
        .toISOString()
        .substring(0, 10);
    }

    // Datos del usuario (la foto ya no viaja acá, tiene su propio flujo)
    const usuarioFormData = new FormData();

    usuarioFormData.append('nombre', formValues.nombre);

    usuarioFormData.append('email', formValues.email);

    this.perfilService
      .updatePerfilSalud(Number(this.usuario.id), perfilSaludData)
      .pipe(
        switchMap(() =>
          this.perfilService.updateUsuario(
            Number(this.usuario!.id),
            usuarioFormData,
          ),
        ),

        switchMap(() =>
          this.perfilService.getUsuarioConHabitos(Number(this.usuario!.id)),
        ),

        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (usuarioActualizado) => {
          if (usuarioActualizado) {
            this.usuario = usuarioActualizado;

            localStorage.setItem(
              'usuario',
              JSON.stringify(this.usuario)
            );
            this.cerrarModal();

            const completarPerfil =
              this.route.snapshot.queryParamMap.get('completarPerfil');
        
            const perfilSalud = usuarioActualizado.perfil_salud;
        
            if (
              completarPerfil === 'true' &&
              perfilSalud?.mostrar_modal_imc === true
            ) {
              this.recomendacionUsuario =
                perfilSalud.recomendacion_enfoque || 'GENERAL';
        
              this.mostrarModalRecomendacion = true;
            }
          }
        
          this.loading = false;
        },

        error: (err) => {
          console.error(
            '[PerfilComponent] Error actualizando perfil o usuario:',
            err,
          );

          this.error =
            'Hubo un error al actualizar el perfil. Por favor, revisa los datos y la imagen.';

          this.loading = false;
        },
      });
  }

  alturaEnCm(): number | null {
    const altura = this.usuario?.perfil_salud?.altura;

    if (altura === null || altura === undefined) {
      return null;
    }

    return Number(altura) * 100;
  }

  cargarProgreso(usuarioId: number): void {
    this.rutinaEjercicioService.obtenerRutinaDelUsuario(usuarioId).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.rutina = res;
        } else if (res && 'results' in res) {
          this.rutina = res.results;
        } else {
          this.rutina = [];
        }
      },

      error: (err) =>
        console.error('Error al obtener la rutina de ejercicios', err),
    });
  }

  get totalHabitos(): number {
    return this.rutina?.length ?? 0;
  }

  get habitosCompletados(): number {
    return (
      this.rutina?.reduce((acc, r) => acc + (r.completado ? 1 : 0), 0) ?? 0
    );
  }

  get porcentajeCompletado(): number {
    return this.totalHabitos
      ? (this.habitosCompletados / this.totalHabitos) * 100
      : 0;
  }

  onCheckboxChange(event: Event, id: number): void {
    const target = event.target as HTMLInputElement;

    if (!target) {
      return;
    }

    this.marcarHabito(id, target.checked);
  }

  marcarHabito(id: number, completado: boolean): void {
    this.rutinaEjercicioService.actualizarRutina(id, { completado }).subscribe({
      next: (rutinaActualizada) => {
        const item = this.rutina.find((r) => r.id === id);

        if (item) {
          item.completado = rutinaActualizada.completado;
        }

        console.log('✅ Ejercicio actualizado');
      },

      error: (err) => console.error('Error al actualizar el ejercicio', err),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
