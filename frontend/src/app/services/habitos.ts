import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habito } from '../models/habito.model';

@Injectable({
  providedIn: 'root'
})
export class HabitosService {
  private apiUrl = 'http://localhost:3000/';
  private progresoUrl = + 'progreso/';

  constructor(private http: HttpClient) {}


  getHabitos(): Observable<Habito[]> {
    return this.http.get<Habito[]>(this.apiUrl);
  }

  createHabito(habito: Habito): Observable<Habito> {
    habito.createdAt = new Date().toISOString();
    habito.updatedAt = new Date().toISOString();
    return this.http.post<Habito>(this.apiUrl, habito);
  }

  updateHabito(habito: Habito): Observable<Habito> {
    const url = `${this.apiUrl}/${habito.id}`;
    habito.updatedAt = new Date().toISOString();
    return this.http.put<Habito>(url, habito);
  }
  
  deleteHabito(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  getProgresoDiario(): Observable<Habito[]> {
    return this.http.get<Habito[]>(this.progresoUrl + 'hoy/');
  }

  marcarHabitoComoCompletado(habitoId: Habito): Observable<Habito> {
    const payload = {
      habito_id: habitoId.id,
      completado: habitoId.completado
    };
    return this.http.post<Habito>(this.progresoUrl + 'marcar/', payload);
  }
}