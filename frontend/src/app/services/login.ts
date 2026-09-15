import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
export interface LoginData {
  email: string;
  password: string;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol?: string;
  password?: string;

  perfil_salud?: {
    peso: number | null;
    altura: number | null;
    genero: string | null;
    fecha_nacimiento: string | null;
    imc: number | null;
    recomendacion_enfoque: string | null;
    mostrar_modal_imc: boolean;
  };
}

interface LoginApiResponse {
  data: {
    id: number;
    nombre: string;
    email: string;
    rol: string;

    perfil_salud?: {
      peso: number | null;
      altura: number | null;
      genero: string | null;
      fecha_nacimiento: string | null;
      imc: number | null;
      recomendacion_enfoque: string | null;
      mostrar_modal_imc: boolean;
    };
  };

  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.backendUrl}/api/login/`;
  private authMeUrl = `${environment.backendUrl}/api/auth/me/`;
  private authLogoutUrl = `${environment.backendUrl}/api/auth/logout/`;

  login(loginData: LoginData): Observable<Usuario | null> {
    return this.http.post<LoginApiResponse>(
      this.apiUrl,
      loginData,
      { withCredentials: true }
    ).pipe(
      map((response) => {
        if (response?.success && response?.data?.id != null) {
          const usuarioConformado: Usuario = {
            id: response.data.id,
            email: response.data.email,
            nombre: response.data.nombre,
            rol: response.data.rol,
          };
          return usuarioConformado;
        }
        return null;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.warn(
            'LoginService: Credenciales inválidas. Devolviendo null.',
            error.status
          );
          return of(null);
        }
        console.error(
          'LoginService: Error grave de conexión o servidor.',
          error
        );
        return throwError(() => error);
      })
    );

    
  }
  obtenerSesion(): Observable<Usuario | null> {
    return this.http.get<LoginApiResponse>(
      this.authMeUrl,
      { withCredentials: true }
    ).pipe(
      map((response) => {
        if (response?.success && response?.data?.id != null) {
          return {
            id: response.data.id,
            email: response.data.email,
            nombre: response.data.nombre,
            rol: response.data.rol,
            perfil_salud: response.data.perfil_salud,
          };
        }
  
        return null;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error obteniendo sesión OAuth:', error);
        return of(null);
      })
    );
  }
  cerrarSesion(): Observable<void> {
    return this.http.post<void>(
      this.authLogoutUrl,
      {},
      { withCredentials: true }
    );
  }
}