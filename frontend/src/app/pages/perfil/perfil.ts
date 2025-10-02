import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../models/perfil.model';
import { PerfilService } from '../../services/perfil';
import { Notificaciones, Notificacion } from '../../services/notificaciones';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class PerfilComponent implements OnInit {
  usuario?: Usuario;
  loading = false;
  error = '';

  listaDeNotificaciones: Notificacion[] = [];

  // Modal
  modalAbierto = false;
  perfilForm: FormGroup;

  constructor(
    private perfilService: PerfilService,
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
     // 2. Lee el 'id' de la URL de forma segura
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
         // 3. Pasa el id de la URL a tu servicio
        this.perfilService.getUsuarioConHabitos(+id).subscribe({
          next: (u) => {
            this.usuario = u;
            this.loading = false;

      
            const fecha = new Date(u.fecha_nacimiento).toISOString().substring(0, 10);
            this.perfilForm.setValue({
              peso: u.peso ?? '',
              altura: u.altura ?? '',
              genero: u.genero ?? '',
              fecha_nacimiento: fecha ?? '',
            });

          },
          error: (err) => {
            this.error = 'No se pudo cargar el perfil';
            this.loading = false;
          },
        });
      } else {
        this.error = 'No se encontró el ID del usuario en la URL.';
        this.loading = false;
      }
    });
  }

  // Modal
  abrirModal(): void {
    if (this.usuario) {
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
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }
    const formValue = this.perfilForm.value;
    console.log('Perfil guardado:', formValue);
    this.cerrarModal();
  }

  // Notificaciones
  toggleNotificacion(id: number): void {
    this.notificacionesService.toggleNotificacion(id);
    this.listaDeNotificaciones = this.notificacionesService.getNotificaciones();
  }
}
