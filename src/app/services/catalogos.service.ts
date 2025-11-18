import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prevision, Rol } from '../models/prevision-rol.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private apiUrl = environment.apiUsuarios;

  constructor(private http: HttpClient) { }

  getPrevisiones(): Observable<Prevision[]> {
    return this.http.get<Prevision[]>(`${this.apiUrl}/previsiones`);
  }

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/roles`);
  }
}
