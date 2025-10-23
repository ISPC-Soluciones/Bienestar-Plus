import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly IS_DEV_MODE = true;

  private userIdSource = new BehaviorSubject<number | null>(null);
  currentUserId$ = this.userIdSource.asObservable();

  constructor() {}

  login(userId: number) {
    this.userIdSource.next(userId);
  }

  logout() {
    this.userIdSource.next(null);
  }
}
