import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlanNutricional, PlanNutricionalDatos } from '../models/plan-nutricional';

interface ConsultaPlan {
  plan: PlanNutricional | null;
  csrf_token: string;
}

@Injectable({ providedIn: 'root' })
export class PlanNutricionalService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.backendUrl.replace(/\/$/, '')}/api/plan-nutricional/`;

  consultar(): Observable<PlanNutricional | null> {
    return this.consultarConToken().pipe(map((respuesta) => respuesta.plan));
  }

  crear(datos: PlanNutricionalDatos): Observable<PlanNutricional> {
    return this.guardar('POST', datos);
  }

  editar(datos: PlanNutricionalDatos): Observable<PlanNutricional> {
    return this.guardar('PATCH', datos);
  }

  private consultarConToken(): Observable<ConsultaPlan> {
    return this.http.get<ConsultaPlan>(this.url, { withCredentials: true });
  }

  private guardar(metodo: 'POST' | 'PATCH', datos: PlanNutricionalDatos): Observable<PlanNutricional> {
    // Refresh the token after login/session rotation; never cache credentials in localStorage.
    return this.consultarConToken().pipe(
      switchMap(({ csrf_token }) => this.http.request<{ plan: PlanNutricional }>(metodo, this.url, {
        body: datos,
        withCredentials: true,
        headers: { 'X-CSRFToken': csrf_token },
      })),
      map((respuesta) => respuesta.plan),
    );
  }
}
