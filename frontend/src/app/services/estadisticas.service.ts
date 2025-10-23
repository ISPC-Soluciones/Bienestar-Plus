import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private refrescar$ = new Subject<void>();
  private baseUrl = 'http://localhost:8000/api/estadisticas/';

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
