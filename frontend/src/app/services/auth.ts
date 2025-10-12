// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // ==========================================================
  // !!! PASO 1: EL INTERRUPTOR TEMPORAL !!!
  // CÁMBIALO a 'false' CUANDO TERMINES TU TRABAJO.
  private readonly IS_DEV_MODE = true;
  // ==========================================================

  private userIdSource = new BehaviorSubject<number | null>(null);
  currentUserId$ = this.userIdSource.asObservable();

  constructor() {}

  login(userId: number) {
    // Aquí podrías guardar el token y otros datos del usuario
    this.userIdSource.next(userId);
  }

  logout() {
    // Limpiar el estado del usuario
    this.userIdSource.next(null);
  }
}
