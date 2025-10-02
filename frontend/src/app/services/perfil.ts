import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario, Habito, ID } from '../models/perfil.model';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private base = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getUsuario(id: ID): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/usuarios/${id}`);
  }

  // Consulta varios hábitos por ids: /habitos?id=1&id=2
  getHabitosByIds(ids: ID[]): Observable<Habito[]> {
    if (!ids || ids.length === 0) return of([]);
    const qs = ids
      .map((id) => `id=${encodeURIComponent(String(id))}`)
      .join('&');
    return this.http.get<Habito[]>(`${this.base}/habitos?${qs}`);
  }

  // Devuelve el usuario, y si trae habitosIds los reemplaza por habitos[]
  getUsuarioConHabitos(id: ID): Observable<Usuario> {
    return this.getUsuario(id).pipe(
      switchMap((user) => {
        // si ya trae objetos habitos los devolvemos tal cual
        if (Array.isArray(user.habitos) && user.habitos.length) {
          return of(user);
        }
        // si trae ids -> buscar los habitos
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