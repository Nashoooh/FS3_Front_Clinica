import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario, LoginRequest } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9000/usuarios';
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;

  constructor(private http: HttpClient) {
    let storedUser = null;
    try {
      const storedUserString = sessionStorage.getItem('currentUser');
      if (storedUserString) {
        storedUser = JSON.parse(storedUserString);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      sessionStorage.removeItem('currentUser');
    }
    
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<Usuario> {
    const loginRequest: LoginRequest = { email, password };
    
    return this.http.post<Usuario>(`${this.apiUrl}/login`, loginRequest)
      .pipe(map(user => {
        // Almacenar usuario en session storage
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  register(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  logout(): void {
    // Remover usuario del session storage y actualizar subject
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return user !== null && user !== undefined;
  }

  getRole(): number | null {
    const user = this.currentUserValue;
    return user ? user.rol : null;
  }

  // Método para recuperar contraseña (verificar si el email existe)
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<Usuario[]>(this.apiUrl)
      .pipe(map(usuarios => usuarios.some(user => user.email === email)));
  }

  // Método para actualizar contraseña (simulado por ahora)
  resetPassword(email: string, newPassword: string): Observable<any> {
    // En un escenario real, esto sería un endpoint específico
    return this.http.get<Usuario[]>(this.apiUrl)
      .pipe(map(usuarios => {
        const user = usuarios.find(u => u.email === email);
        if (user) {
          // Aquí normalmente harías un PUT al backend con la nueva contraseña
          return { success: true, message: 'Contraseña actualizada correctamente' };
        }
        return { success: false, message: 'Usuario no encontrado' };
      }));
  }
}
