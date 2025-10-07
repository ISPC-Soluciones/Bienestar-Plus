import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs'; 
import { catchError, map } from 'rxjs/operators'; 

export interface LoginData {
  email: string;
  password: string;
}


export interface Usuario { 
  id: number;
  email: string; 
  nombre: string;
  password?: string; 
}


interface LoginApiResponse {
    data: {
        id: number;
        nombre: string;
        mail: string; 
        rol: string;
    };
    success: boolean;
   
}


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/login/';
  private usuariosUrl = 'http://127.0.0.1:8000/api/usuarios/';

  
  login(loginData: LoginData): Observable<Usuario | null> { 
  
    return this.http.post<LoginApiResponse>(this.apiUrl, loginData).pipe(
      
      
      map(response => {
          
          if (response.success && response.data && typeof response.data.id === 'number') {
              
      const usuarioConformado: Usuario = {
                  id: response.data.id,
                  email: response.data.mail,
                  nombre: response.data.nombre,
                
              };
              return usuarioConformado;
          }
      
          return null;
      }),

      
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401 || error.status === 403) {
          console.warn('LoginService: Credenciales inválidas. Devolviendo null.', error.status);
          return of(null); 
        }

   
        console.error('LoginService: Error grave de conexión o servidor.', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los usuarios (para testing)
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.usuariosUrl);
  }
}