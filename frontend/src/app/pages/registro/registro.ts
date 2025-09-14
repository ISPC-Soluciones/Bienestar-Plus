import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { RegistroServicio } from '../../services/registroServicio';



const contraseñaigual: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmar = control.get('confirmar');

    
    return password && confirmar && password.value !== confirmar.value ? { 'mismatch': true } : null;
};
const soloCaracteres: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const contieneNumeros = /\d/.test(control.value);
    return contieneNumeros ? { 'numerosNoPermitidos': true } : null;
};
@Component({
    selector: 'app-registro',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './registro.html',
    styleUrl: './registro.css'
})
export class Registro  {
    registroForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private registroService: RegistroServicio
    ) {
       
        this.registroForm = this.fb.group({
            nombre: ['', [Validators.required,Validators.minLength(3),soloCaracteres]],
            email: ['', [Validators.required, Validators.email]],
            telefono: ['', Validators.required],
            edad: ['', Validators.required],
            genero: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmar: ['', Validators.required],
        }, { validators: contraseñaigual });
    }

    

    EnviarFormulario(): void {
        if (this.registroForm.valid) {
            const nuevoUsuario = this.registroForm.value;

            
            this.registroService.registrarUsuario(nuevoUsuario).subscribe(
                (respuesta) => {
                    console.log('Usuario registrado:', respuesta);
                    alert('¡Registro exitoso!');
                    this.registroForm.reset();
                },
                (error) => {
                    console.error('Error al registrar usuario:', error);
                    alert('Ocurrió un error. Por favor, inténtelo de nuevo.');
                }
            );
        } else {
            this.registroForm.markAllAsTouched();
        }
    }
}
