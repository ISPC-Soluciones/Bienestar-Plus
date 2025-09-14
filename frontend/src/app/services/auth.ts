// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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
