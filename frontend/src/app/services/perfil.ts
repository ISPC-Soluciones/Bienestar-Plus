import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario, Habito, ID, PerfilSalud } from '../models/perfil.model';
import { Observable, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private base = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getUsuario(id: ID): Observable<Usuario> {
    return this.http.get<{ success: boolean; data: Usuario }>(`${this.base}/usuarios/${id}/`).pipe(
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

  getPerfilSalud(id: number): Observable<PerfilSalud> {
    return this.http.get<PerfilSalud>(`${this.base}/perfil-salud/${id}/`);
  }

  updatePerfilSalud(id: number, data: Partial<PerfilSalud>): Observable<PerfilSalud> {
    return this.http.put<PerfilSalud>(`${this.base}/perfil-salud/${id}/`, data).pipe(
      tap((resp) => console.log('Perfil de salud actualizado:', resp))
    );
  }

  getUsuarioConHabitos(id: ID): Observable<Usuario> {
    return this.getUsuario(id).pipe(
      switchMap((user) => {
        const habitos$ =
          Array.isArray(user.habitos) && user.habitos.length
            ? of(user.habitos)
            : Array.isArray(user.habitosIds) && user.habitosIds.length
            ? this.getHabitosByIds(user.habitosIds)
            : of([]);

        return habitos$.pipe(
          switchMap((habitos) => {
            return this.getPerfilSalud(Number(id)).pipe(
              map((perfilSalud) => ({
                ...user,
                habitos,
                perfil_salud: perfilSalud,
              }))
            );
          })
        );
      })
    );
  }
}
