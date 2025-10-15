import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario, Habito, ID } from '../models/perfil.model';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private base = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getUsuario(id: ID): Observable<Usuario> {
    return this.http.get<{ success: boolean; data: Usuario }>(`${this.base}/usuarios/${id}`).pipe(
      map((res) => res.data ?? (res as any))
    );
  }

  getHabitosByIds(ids: ID[]): Observable<Habito[]> {
    if (!ids?.length) return of([]);
    const qs = ids.map((id) => `id=${encodeURIComponent(String(id))}`).join('&');
    return this.http.get<Habito[]>(`${this.base}/habitos?${qs}`);
  }

  updateUsuario(id: number, data: FormData | any): Observable<Usuario> {
    return this.http.patch<{ success: boolean; data: Usuario }>(`${this.base}/usuarios/${id}/`, data).pipe(
      map((res) => res.data ?? res)
    );
  }

  updatePerfilSalud(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/perfil-salud/${id}/`, data);
  }
  

  getUsuarioConHabitos(id: ID): Observable<Usuario> {
    return this.getUsuario(id).pipe(
      switchMap((user) => {
        if (Array.isArray(user.habitos) && user.habitos.length) {
          return of(user);
        }
        if (Array.isArray(user.habitosIds) && user.habitosIds.length) {
          return this.getHabitosByIds(user.habitosIds).pipe(
            map((habitos) => ({ ...user, habitos }))
          );
        }
        return of(user);
      })
    );
  }
}
