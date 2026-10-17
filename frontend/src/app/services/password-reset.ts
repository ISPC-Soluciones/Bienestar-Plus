import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface PasswordResetResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.backendUrl}/api/password-reset`;

  requestReset(email: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/request/`, {
      email,
    });
  }

  confirmReset(
    token: string,
    password: string,
    confirmarPassword: string,
  ): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/confirm/`, {
      token,
      password,
      confirmar_password: confirmarPassword,
    });
  }
}
