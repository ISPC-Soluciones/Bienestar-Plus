import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistroServicio {
  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) { }
   registrarUsuario(usuario: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(this.apiUrl, usuario, { headers: headers });
  }
}
