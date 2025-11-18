import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Analisis, Laboratorio, SolicitudAnalisis } from '../models/citas.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // --- Análisis ---
  getAnalisis(): Observable<Analisis[]> {
    return this.http.get<Analisis[]>(`${this.apiUrl}/analisis`);
  }

  getAnalisisById(id: number): Observable<Analisis> {
    return this.http.get<Analisis>(`${this.apiUrl}/analisis/${id}`);
  }

  createAnalisis(analisis: Analisis): Observable<Analisis> {
    return this.http.post<Analisis>(`${this.apiUrl}/analisis`, analisis);
  }

  updateAnalisis(id: number, analisis: Analisis): Observable<Analisis> {
    return this.http.put<Analisis>(`${this.apiUrl}/analisis/${id}`, analisis);
  }

  deleteAnalisis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/analisis/${id}`);
  }

  // --- Laboratorios ---
  getLaboratorios(): Observable<Laboratorio[]> {
    return this.http.get<Laboratorio[]>(`${this.apiUrl}/laboratorios`);
  }

  getLaboratorioById(id: number): Observable<Laboratorio> {
    return this.http.get<Laboratorio>(`${this.apiUrl}/laboratorios/${id}`);
  }

  createLaboratorio(laboratorio: Laboratorio): Observable<Laboratorio> {
    return this.http.post<Laboratorio>(`${this.apiUrl}/laboratorios`, laboratorio);
  }

  updateLaboratorio(id: number, laboratorio: Laboratorio): Observable<Laboratorio> {
    return this.http.put<Laboratorio>(`${this.apiUrl}/laboratorios/${id}`, laboratorio);
  }

  deleteLaboratorio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/laboratorios/${id}`);
  }

  // --- Solicitudes de Análisis (Citas) ---
  getSolicitudes(): Observable<SolicitudAnalisis[]> {
    return this.http.get<SolicitudAnalisis[]>(`${this.apiUrl}/solicitud-analisis`);
  }

  createSolicitud(solicitud: SolicitudAnalisis): Observable<SolicitudAnalisis> {
    return this.http.post<SolicitudAnalisis>(`${this.apiUrl}/solicitud-analisis`, solicitud);
  }

  deleteSolicitud(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/solicitud-analisis/${id}`);
  }
}
