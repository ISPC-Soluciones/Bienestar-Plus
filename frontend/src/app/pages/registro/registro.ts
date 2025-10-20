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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  registroForm: FormGroup;

  recomendacionUsuario: string | null = null;
  mostrarModalRecomendacion: boolean = false;

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
    this.mostrarModalRecomendacion = false;
    this.router.navigate(['/login']);
  }

  EnviarFormulario(): void {
    if (this.registroForm.valid) {
      const datosdelform = this.registroForm.value;

      // 1. Desestructurar para separar perfil_salud y descartar confirmar
      const { perfil_salud, confirmar, ...usuarioData } = datosdelform;

      // 2. Construir el payload final, incluyendo campos por defecto
      const payload: any = {
        // Usamos 'any' porque vamos a eliminar una propiedad dinámicamente
        ...usuarioData,
        habitos: [],
        progreso:
          'Aún no tienes progreso. ¡Comienza a usar la app para verlo aquí!',
        foto: 'assets/default-user.jpg',
        grafico: 'assets/default-graph.jpg', // 3. Añadir perfil_salud con valores numéricos o null

        perfil_salud: {
          peso: perfil_salud.peso ? Number(perfil_salud.peso) : null,
          altura: perfil_salud.altura ? Number(perfil_salud.altura) : null,
        },
      }; // 4. Eliminar el grupo perfil_salud si ambos campos están vacíos (TK77)

      if (
        payload.perfil_salud.peso === null &&
        payload.perfil_salud.altura === null
      ) {
        delete payload.perfil_salud;
      } // 5. Enviar el payload completo

      this.registroService.registrarUsuario(payload).subscribe(
        (respuesta) => {
          console.log('Usuario registrado:', respuesta);
          this.registroForm.reset(); // Resetear el formulario al éxito

          // 6. Lógica de manejo de respuesta (TK78 / Redirección)
          if (
            respuesta.perfil_salud &&
            respuesta.perfil_salud.mostrar_modal_imc
          ) {
            this.recomendacionUsuario =
              respuesta.perfil_salud.recomendacion_enfoque;
            this.mostrarModalRecomendacion = true;
          } else {
            // Redirección si no se muestra el modal
            this.router.navigate(['/login']);
          }
        },
        (error: any) => {
          // ✅ Corregido el error TS7006 al especificar el tipo 'any'
          console.error('Error al registrar usuario:', error); // Reemplazar alert por una notificación adecuada si es posible
          alert('Ocurrió un error. Por favor, inténtelo de nuevo.');
        }
      );
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}
