import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoginService, LoginData } from '../../services/login';
import { PerfilService } from '../../services/perfil';


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private loginService = inject(LoginService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage = '';

  onSubmit() {
    this.errorMessage = ''; 
  
    if (this.loginForm.valid) {
      const loginData: LoginData = {
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!
      };
  
      this.loginService.login(loginData).subscribe({
        next: (usuario) => {
          if (usuario && typeof usuario.id === 'number') {
            console.log('Login exitoso. Navegando a /perfil con ID:', usuario.id);
  
            localStorage.setItem('usuario', JSON.stringify(usuario));
  
            this.authService.login(usuario.id);

            this.router.navigate(['/perfil', usuario.id]);
          } else {
            this.errorMessage = 'Email o contraseña incorrectos.';
          }
        },
        error: (err) => {
          console.error('Error de conexión o servidor:', err);
          this.errorMessage = 'Error de conexión con el servidor. Intente más tarde.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}

export class LoginComponent {
  loginData: LoginData = { email: '', password: '' };
  error = '';

  constructor(
    private loginService: LoginService,
    private perfilService: PerfilService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loginService.login(this.loginData).subscribe({
      next: (usuarioBasico) => {
        if (!usuarioBasico) {
          this.error = 'Credenciales inválidas';
          return;
        }

        // 🔹 Obtener el perfil completo y guardarlo en localStorage
        this.perfilService.getUsuarioConHabitos(usuarioBasico.id).subscribe({
          next: (usuarioCompleto) => {
            localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
            console.log('🟢 Usuario completo guardado:', usuarioCompleto);
            this.router.navigate(['/perfil']);
          },
          error: (err) => {
            console.error('❌ Error al cargar usuario completo', err);
          },
        });
      },
      error: () => (this.error = 'Error al conectar con el servidor'),
    });
  }
}