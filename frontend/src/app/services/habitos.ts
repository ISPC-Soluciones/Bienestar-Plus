import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habito } from '../models/habito.model';

@Injectable({
  providedIn: 'root'
})
export class HabitosService {
  private baseUrl = 'http://localhost:8000/api/';
  private habitosUrl = this.baseUrl + 'habitos/';
  private progresoUrl = this.baseUrl + 'progreso/';

  constructor(private http: HttpClient) {}


  getHabitos(): Observable<Habito[]> {
    return this.http.get<Habito[]>(this.habitosUrl);
  }

  createHabito(habito: Habito): Observable<Habito> {
    habito.createdAt = new Date().toISOString();
    habito.updatedAt = new Date().toISOString();
    return this.http.post<Habito>(this.habitosUrl, habito);
  }

  updateHabito(habito: Habito): Observable<Habito> {
    const url = `${this.habitosUrl}${habito.id}/`;
    habito.updatedAt = new Date().toISOString();
    return this.http.put<Habito>(url, habito);
  }
  
  deleteHabito(id: number): Observable<void> {
    const url = `${this.habitosUrl}${id}/`;
    return this.http.delete<void>(url);
  }

  getProgresoDiario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.progresoUrl}?usuario_id=${usuarioId}`);
  }

  marcarHabitoComoCompletado(progresoId: number, completado: boolean): Observable<any> {
    const payload = { progreso_id: progresoId, completado };
    return this.http.patch<any>(this.progresoUrl, payload);
  }
}
