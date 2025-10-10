import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface LoginData {
  email: string;
  password: string;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/usuarios';

  /**
   * Realiza login básico consultando usuarios por email
   */
  login(loginData: LoginData): Observable<Usuario | null> {
    return this.http.get<Usuario[]>(`${this.apiUrl}?email=${loginData.email}`)
      .pipe(
        map(usuarios => {
          const usuario = usuarios[0];
          
          // Verificar si existe y la contraseña coincide
          if (usuario && usuario.password === loginData.password) {
            return usuario;
          }
          
          return null;
        })
      );
  }

  /**
   * Obtiene todos los usuarios (para testing)
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
}
