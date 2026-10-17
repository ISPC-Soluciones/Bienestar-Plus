import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioCreateDTO } from '../models/perfil.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistroServicio {
  private apiUrl = `${environment.backendUrl}/api/registro/`;
  private notificacionesUrl = `${environment.backendUrl}/api/notificaciones/`;

  constructor(private http: HttpClient) {}

  registrarUsuario(usuario: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, usuario, { headers });
  }
}
