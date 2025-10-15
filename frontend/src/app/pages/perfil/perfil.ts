import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../models/perfil.model';
import { PerfilService } from '../../services/perfil';
import { Notificaciones, Notificacion } from '../../services/notificaciones';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProgresoService } from '../../services/progreso';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class PerfilComponent implements OnInit {
  usuario?: Usuario;
  loading = false;
  error = '';

  listaDeNotificaciones: Notificacion[] = [];

  modalAbierto = false;
  perfilForm: FormGroup;

  rutina: any[] = []; 

  constructor(
    private perfilService: PerfilService,
    private progresoService: ProgresoService,
    private route: ActivatedRoute,
    private notificacionesService: Notificaciones,
    private fb: FormBuilder
  ) {
    this.perfilForm = this.fb.group({
      peso: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      altura: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      genero: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
    });
  }

  get pesoControl(): AbstractControl { return this.perfilForm.get('peso')!; }
  get alturaControl(): AbstractControl { return this.perfilForm.get('altura')!; }
  get generoControl(): AbstractControl { return this.perfilForm.get('genero')!; }
  get fechaNacimientoControl(): AbstractControl { return this.perfilForm.get('fecha_nacimiento')!; }

  ngOnInit(): void {
    this.listaDeNotificaciones = this.notificacionesService.getNotificaciones();
    this.loading = true;
  
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
  
      if (id) {
        // 🔹 Caso 1: viene por la URL
        this.cargarPerfil(+id);
      } else {
        // 🔹 Caso 2: lo obtenemos del localStorage
        const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
    }

    if (id) {
      // ✅ Cargar datos actualizados del backend
      this.cargarPerfil(+id);
    } else if (this.usuario?.id) {
      // ✅ Si no hay ID en la ruta, usar el del localStorage
      this.cargarPerfil(Number(this.usuario.id));
    } else {
      this.error = 'No se encontró información del usuario.';
    }
      }
    });
  }
  
  private cargarPerfil(id: number): void {
    console.log('🟦 Cargando perfil para ID:', id);
  
    this.perfilService.getUsuarioConHabitos(id).subscribe({
      next: (u) => {
        console.log('🟩 Respuesta del backend:', u);
  
        // ✅ Adaptar la estructura si viene envuelta en { success, data }
        const usuarioData = (u as any)?.data ? (u as any).data : u;
  
        this.usuario = { ...this.usuario, ...usuarioData };
        this.loading = false;
  
        if (usuarioData.fecha_nacimiento) {
          const fecha = new Date(usuarioData.fecha_nacimiento)
            .toISOString()
            .substring(0, 10);
          this.perfilForm.setValue({
            peso: usuarioData.peso ?? '',
            altura: usuarioData.altura ?? '',
            genero: usuarioData.genero ?? '',
            fecha_nacimiento: fecha ?? '',
          });
        }
  
        this.cargarProgreso(id);
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil';
        this.loading = false;
      },
    });
  }
  

  cargarProgreso(usuarioId: number): void {
    this.progresoService.getProgresoDiario(usuarioId).subscribe({
      next: (progresos) => {
        this.rutina = progresos;
        console.log('✅ Progreso diario:', progresos);
      },
      error: (err) => {
        console.error('Error al obtener progreso diario', err);
      },
    });
  }

  get totalHabitos(): number {
    return this.rutina?.length || 0;
  }

  get habitosCompletados(): number {
    return this.rutina?.filter((r) => r.completado).length || 0;
  }

  get porcentajeCompletado(): number {
    if (!this.rutina?.length) return 0;
    return (this.habitosCompletados / this.totalHabitos) * 100;
  }

  onCheckboxChange(event: Event, id: number): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    const checked = target.checked;
    this.marcarHabito(id, checked);
  }

  marcarHabito(id: number, completado: boolean): void {
    this.progresoService.marcarCompletado(id, completado).subscribe({
      next: () => console.log('✅ Hábito actualizado'),
      error: (err) => console.error('Error al actualizar hábito', err),
    });
  }

  abrirModal(): void {
    if (this.usuario && this.usuario.fecha_nacimiento) {
      const fecha = new Date(this.usuario.fecha_nacimiento).toISOString().substring(0, 10);
      this.perfilForm.setValue({
        peso: this.usuario.peso ?? '',
        altura: this.usuario.altura ?? '',
        genero: this.usuario.genero ?? '',
        fecha_nacimiento: fecha ?? '',
      });
    }
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid || !this.usuario) {
      this.perfilForm.markAllAsTouched();
      return;
    }
  
    const datos = this.perfilForm.value;
  
    this.perfilService.updatePerfilSalud(Number(this.usuario.id), datos).subscribe({
      next: (resp) => {
        console.log('✅ Perfil de salud actualizado:', resp);
        this.cerrarModal();
      },
      error: (err) => {
        console.error('❌ Error al actualizar perfil de salud:', err);
      },
    });
  }
  

  toggleNotificacion(id: number): void {
    this.notificacionesService.toggleNotificacion(id);
    this.listaDeNotificaciones = this.notificacionesService.getNotificaciones();
  }
}
