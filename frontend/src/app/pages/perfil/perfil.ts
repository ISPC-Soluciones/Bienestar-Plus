import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PerfilService } from '../../services/perfil';
import { ProgresoService } from '../../services/progreso';
import { Notificaciones, Notificacion } from '../../services/notificaciones';
import { Usuario, PerfilSalud } from '../../models/perfil.model';

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

  ngOnInit(): void {
    this.listaDeNotificaciones = this.notificacionesService.getNotificaciones();
    this.loading = true;
  
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.cargarPerfil(+id); // Trae del backend
      } else {
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
          this.usuario = JSON.parse(usuarioGuardado);
          this.cargarPerfil(Number(this.usuario?.id)); // Siempre refrescar del backend
        } else {
          this.error = 'No se encontró información del usuario.';
          this.loading = false;
        }
      }
    });
  }
  

  private cargarPerfil(id: number): void {
    this.perfilService.getUsuarioConHabitos(id).subscribe({
      next: (res) => {
        const usuarioData: Usuario = (res as any)?.data ? (res as any).data : res;
        this.usuario = usuarioData;

        const salud: PerfilSalud | undefined = usuarioData.perfil_salud;
        if (salud) {
          this.perfilForm.setValue({
            peso: salud.peso ?? '',
            altura: salud.altura ?? '',
            genero: salud.genero ?? '',
            fecha_nacimiento: salud.fecha_nacimiento
              ? new Date(salud.fecha_nacimiento).toISOString().substring(0, 10)
              : '',
          });
        }

        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil';
        this.loading = false;
      },
    });
  }

  abrirModal(): void {
    if (!this.usuario) return;

    const salud = this.usuario.perfil_salud;
    this.perfilForm.setValue({
      peso: salud?.peso ?? '',
      altura: salud?.altura ?? '',
      genero: salud?.genero ?? '',
      fecha_nacimiento: salud?.fecha_nacimiento
        ? new Date(salud.fecha_nacimiento).toISOString().substring(0, 10)
        : '',
    });
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardarPerfil(): void {
    if (!this.usuario || this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    const datos = { ...this.perfilForm.value };

if (datos.peso) datos.peso = Number(datos.peso);
if (datos.altura) datos.altura = Number(datos.altura);

if (datos.fecha_nacimiento) {
  datos.fecha_nacimiento = new Date(datos.fecha_nacimiento)
    .toISOString()
    .substring(0, 10);
}


    this.perfilService.updatePerfilSalud(Number(this.usuario.id), datos).subscribe({
      next: (perfilActualizado: PerfilSalud) => {
        console.log('✅ Perfil actualizado:', perfilActualizado);

        // Actualizamos solo perfil_salud
        this.usuario = {
          ...this.usuario!,
          perfil_salud: perfilActualizado
        };

        localStorage.setItem('usuario', JSON.stringify(this.usuario));
        this.cerrarModal();
      },
      error: (err) => {
        console.error('❌ Error al actualizar perfil de salud:', err);
        alert('Hubo un error al actualizar el perfil. Verifica los datos ingresados.');
      },
    });
  }

  cargarProgreso(usuarioId: number): void {
    this.progresoService.getProgresoDiario(usuarioId).subscribe({
      next: (res) => (this.rutina = res),
      error: (err) => console.error('Error al obtener progreso diario', err),
    });
  }

  // Funciones de progreso
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
    const target = event.target as HTMLInputElement;
    if (!target) return;
    this.marcarHabito(id, target.checked);
  }

  marcarHabito(id: number, completado: boolean): void {
    this.progresoService.marcarCompletado(id, completado).subscribe({
      next: () => console.log('✅ Hábito actualizado'),
      error: (err) => console.error('Error al actualizar hábito', err),
    });
  }

  toggleNotificacion(id: number): void {
    this.notificacionesService.toggleNotificacion(id);
    this.listaDeNotificaciones = this.notificacionesService.getNotificaciones();
  }
}
