import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Examen {
  id?: number;
  usuarioId?: number;
  laboratorioId?: number;
  analisisId?: number;
  fechaExamen?: string;
  resultado?: string;
  // Campos adicionales del backend
  laboratorioDireccion?: string;
  analisisNombre?: string;
  analisisDescripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class ExamenService {
  private apiUrl = environment.apiExamenes + '/examenes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Examen[]> {
    return this.http.get<Examen[]>(this.apiUrl);
  }

  getByPaciente(usuarioId: number): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  getById(id: number): Observable<Examen> {
    return this.http.get<Examen>(`${this.apiUrl}/${id}`);
  }

  create(examen: Examen): Observable<Examen> {
    return this.http.post<Examen>(this.apiUrl, examen);
  }

  update(id: number, examen: Examen): Observable<Examen> {
    return this.http.put<Examen>(`${this.apiUrl}/${id}`, examen);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
