import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ResumenHidratacion,
  TipoHidratacion,
} from '../models/hidratacion';

interface ConsultaHidratacion extends ResumenHidratacion {
  csrf_token: string;
}

/**
 * Registros de agua del día del usuario en sesión.
 */
@Injectable({ providedIn: 'root' })
export class HidratacionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.backendUrl.replace(/\/$/, '')}/api/hidratacion/`;

  consultar(): Observable<ResumenHidratacion> {
    return this.http.get<ConsultaHidratacion>(this.url, { withCredentials: true });
  }

  agregar(tipo: TipoHidratacion): Observable<ResumenHidratacion> {
    return this.conToken((token) =>
      this.http.post<ResumenHidratacion>(
        this.url,
        { tipo },
        { withCredentials: true, headers: { 'X-CSRFToken': token } },
      ),
    );
  }

  eliminar(id: number): Observable<ResumenHidratacion> {
    return this.conToken((token) =>
      this.http.delete<ResumenHidratacion>(`${this.url}${id}/`, {
        withCredentials: true,
        headers: { 'X-CSRFToken': token },
      }),
    );
  }

  /** Pide un token CSRF actualizado y después hace la escritura. */
  private conToken(
    escritura: (token: string) => Observable<ResumenHidratacion>,
  ): Observable<ResumenHidratacion> {
    return this.http
      .get<ConsultaHidratacion>(this.url, { withCredentials: true })
      .pipe(switchMap(({ csrf_token }) => escritura(csrf_token)));
  }
}