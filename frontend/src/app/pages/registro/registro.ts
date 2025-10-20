import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { RegistroServicio } from '../../services/registroServicio';
import { Router } from '@angular/router';
import { ModalBienvenida } from './modal-bienvenida/modal-bienvenida';

const contraseñaigual: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmar = control.get('confirmar');

  return password && confirmar && password.value !== confirmar.value
    ? { mismatch: true }
    : null;
};
const soloCaracteres: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const contieneNumeros = /\d/.test(control.value);
  return contieneNumeros ? { numerosNoPermitidos: true } : null;
};
@Component({
  selector: 'app-registro',
  standalone: true, // Asegurar que sea standalone si no lo es
  imports: [CommonModule, ReactiveFormsModule, ModalBienvenida],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  registroForm: FormGroup;

  recomendacionUsuario: string | null = null;
  mostrarModalRecomendacion: boolean = false;
  private ultimoUsuarioId: number | null = null; // ✅ Guardaremos el ID aquí

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroServicio,
    private router: Router
  ) {
    this.registroForm = this.fb.group(
      {
        nombre: [
          '',
          [Validators.required, Validators.minLength(3), soloCaracteres],
        ],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required],
        edad: ['', Validators.required],
        genero: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmar: ['', Validators.required],
        perfil_salud: this.fb.group({
          peso: [null, [Validators.min(10), Validators.max(300)]],
          altura: [null, [Validators.min(0.5), Validators.max(2.5)]],
        }),
      },
      { validators: contraseñaigual }
    );
  }

  cerrarModal(): void {
    this.mostrarModalRecomendacion = false; // ✅ REDIRECCIÓN FINAL: Ir al perfil con el ID guardado
    if (this.ultimoUsuarioId) {
      this.router.navigate(['/perfil', this.ultimoUsuarioId]);
    } else {
      // Fallback: Si no hay ID, ir a login
      this.router.navigate(['/login']);
    }
  }

  EnviarFormulario(): void {
    if (this.registroForm.valid) {
      const datosdelform = this.registroForm.value; // 1. Desestructurar para separar perfil_salud y descartar confirmar

      const { perfil_salud, confirmar, ...usuarioData } = datosdelform; // 2. Construir el payload final, incluyendo campos por defecto

      const payload: any = {
        ...usuarioData,
        habitos: [],
        progreso:
          'Aún no tienes progreso. ¡Comienza a usar la app para verlo aquí!',
        foto: 'assets/default-user.jpg',
        grafico: 'assets/default-graph.jpg',

        perfil_salud: {
          peso: perfil_salud.peso ? Number(perfil_salud.peso) : null,
          altura: perfil_salud.altura ? Number(perfil_salud.altura) : null,
        },
      };

      if (
        payload.perfil_salud.peso === null &&
        payload.perfil_salud.altura === null
      ) {
        delete payload.perfil_salud;
      }

      this.registroService.registrarUsuario(payload).subscribe(
        (respuesta) => {
          console.log('Usuario registrado:', respuesta);
          this.registroForm.reset();

          const perfilSalud = respuesta?.data?.perfil_salud;
          const usuarioId = respuesta?.data?.id;

          const mostrarModal = perfilSalud?.mostrar_modal_imc === true;
          const recomendacion = perfilSalud?.recomendacion_enfoque;

          this.ultimoUsuarioId = usuarioId; // ✅ Guardamos el ID aquí // 3. Lógica de manejo de respuesta (Mostrar Modal o Redirigir)

          if (mostrarModal) {
            // ✅ ACTIVAR EL MODAL DE BIENVENIDA
            this.recomendacionUsuario = recomendacion || 'GENERAL';
            this.mostrarModalRecomendacion = true; // La redirección ocurre cuando se llama this.cerrarModal()
          } else {
            // Redirección inmediata si no se necesita el modal
            this.router.navigate(['/perfil', usuarioId]);
          }
        },
        (error: any) => {
          console.error('Error al registrar usuario:', error);
          alert('Ocurrió un error. Por favor, inténtelo de nuevo.');
        }
      );
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}
