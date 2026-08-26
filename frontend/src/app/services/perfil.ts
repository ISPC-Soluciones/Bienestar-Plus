import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Usuario, Habito, ID, PerfilSalud } from '../models/perfil.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private base = `${environment.backendUrl}/api`;

  constructor(private http: HttpClient) {}

  // Obtener usuario
  getUsuario(id: ID): Observable<Usuario | undefined> {
    return this.http
      .get<{ success: boolean; data: Usuario }>(
        `${this.base}/usuarios/${id}/`
      )
      .pipe(
        map(res => res.data ?? undefined),
        catchError(err => {
          console.error('Error obteniendo usuario:', err);
          return of(undefined);
        })
      );
  }

  // Obtener hábitos por IDs
  getHabitosByIds(ids: ID[]): Observable<Habito[]> {
    if (!ids?.length) {
      return of([]);
    }

    const qs = ids
      .map(id => `id=${encodeURIComponent(String(id))}`)
      .join('&');

    return this.http
      .get<Habito[]>(`${this.base}/habitos?${qs}`)
      .pipe(
        catchError(err => {
          console.error('Error obteniendo hábitos:', err);
          return of([]);
        })
      );
  }

  // Actualizar usuario
  updateUsuario(
    id: number,
    data: any
  ): Observable<Usuario | undefined> {
    return this.http
      .patch<{ success: boolean; data: Usuario }>(
        `${this.base}/usuarios/${id}/`,
        data
      )
      .pipe(
        map(res => res.data ?? undefined),
        catchError(err => {
          console.error('Error actualizando usuario:', err);
          return of(undefined);
        })
      );
  }

  // Obtener perfil de salud
  getPerfilSalud(
    id: number
  ): Observable<PerfilSalud | undefined> {
    return this.http
      .get<PerfilSalud>(
        `${this.base}/perfil-salud/${id}/`
      )
      .pipe(
        catchError(err => {
          console.error('Error obteniendo perfil de salud:', err);
          return of(undefined);
        })
      );
  }

  // Actualizar perfil de salud
  updatePerfilSalud(
    id: number,
    data: Partial<PerfilSalud>
  ): Observable<PerfilSalud | undefined> {
    return this.http
      .put<PerfilSalud>(
        `${this.base}/perfil-salud/${id}/`,
        data
      )
      .pipe(
        catchError(err => {
          console.error('Error actualizando perfil de salud:', err);
          return of(undefined);
        })
      );
  }

  // Obtener usuario con hábitos y perfil de salud
  getUsuarioConHabitos(
    id: ID
  ): Observable<Usuario | undefined> {
    return this.getUsuario(id).pipe(
      switchMap(user => {
        if (!user) {
          return of(undefined);
        }

        const habitos$ =
          Array.isArray(user.habitos) && user.habitos.length
            ? of(user.habitos)
            : Array.isArray(user.habitosIds) && user.habitosIds.length
              ? this.getHabitosByIds(user.habitosIds)
              : of([]);

        return forkJoin({
          perfil_salud: this.getPerfilSalud(Number(id)),
          habitos: habitos$
        }).pipe(
          map(res => ({
            ...user,
            perfil_salud: res.perfil_salud,
            habitos: res.habitos
          }))
        );
      })
    );
  }
}