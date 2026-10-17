import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly IS_DEV_MODE = true;

  private userIdSource = new BehaviorSubject<number | null>(this.obtenerUsuarioIdGuardado());
  currentUserId$ = this.userIdSource.asObservable();

  constructor() {}

  private obtenerUsuarioIdGuardado(): number | null {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) return null;
    try {
      const usuario = JSON.parse(usuarioGuardado);
      return usuario?.id ?? null;
    } catch {
      return null;
    }
  }

  login(userId: number) {
    this.userIdSource.next(userId);
  }

  logout() {
    localStorage.removeItem('usuario');
    this.userIdSource.next(null);
  }
}