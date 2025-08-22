import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-registro',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
    registroForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmar: ['', Validators.required]
    });
  }
   onSubmit() {
     if (this.registroForm.valid) {
    console.log('Formulario enviado:', this.registroForm.value);
  } else {
      this.registroForm.markAllAsTouched(); 
    }
  }
}

