import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private refrescar$ = new Subject<void>();
  private baseUrl = `${environment.backendUrl}/api/estadisticas/`;

  constructor(private http: HttpClient) {}

  get refrescar() {
    return this.refrescar$.asObservable();
  }

  emitirRefresco() {
    this.refrescar$.next();
  }

  obtenerEstadisticas() {
    return this.http.get<any>(this.baseUrl);
  }
}
