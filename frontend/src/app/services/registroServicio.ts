import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioCreateDTO } from '../models/perfil.model';

@Injectable({
  providedIn: 'root',
})
export class RegistroServicio {
  private apiUrl = 'http://127.0.0.1:8000/registro/';
  private notificacionesUrl = 'http://127.0.0.1:8000/notificaciones/'; 

  constructor(private http: HttpClient) {}

  registrarUsuario(usuario: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, usuario, { headers });
  }


}
