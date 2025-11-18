import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Usuario, LoginRequest, LoginResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9000/usuarios';
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser: Observable<Usuario | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    
    // Intentar cargar el usuario SOLO si hay un token guardado
    const token = sessionStorage.getItem('token');
    if (token) {
      this.loadCurrentUser().subscribe({
        error: (err) => {
          console.error('Error al cargar usuario:', err);
          // Si falla, limpiar el token inválido
          this.logout();
        }
      });
    }
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Hace login y guarda el token JWT en sessionStorage
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { email, password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          // Guardar el token en sessionStorage
          sessionStorage.setItem('token', response.token);
          console.log('✅ Token guardado:', response.token);
        }),
        tap(() => {
          // Cargar los datos completos del usuario
          this.loadCurrentUser().subscribe();
        })
      );
  }

  /**
   * Obtiene el usuario actual usando el token JWT
   */
  loadCurrentUser(): Observable<Usuario | null> {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      this.currentUserSubject.next(null);
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    return this.http.get<Usuario>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => {
          console.log('👤 Usuario cargado desde /me:', user);
          this.currentUserSubject.next(user);
        }),
        map(user => user),
        catchError((error) => {
          console.error('❌ Error al cargar usuario desde /me:', error);
          // Si hay error, limpiar sesión sin hacer logout completo
          sessionStorage.removeItem('token');
          this.currentUserSubject.next(null);
          return of(null);
        })
      );
  }

  register(usuario: any): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  logout(): void {
    // Remover token y usuario del session storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    console.log('🚪 Sesión cerrada');
  }

  isLoggedIn(): boolean {
    const token = sessionStorage.getItem('token');
    return token !== null && token !== undefined && token !== '';
  }

  getRole(): number | null {
    const user = this.currentUserValue;
    return user ? user.rol.id : null;
  }
  
  getRoleName(): string | null {
    const user = this.currentUserValue;
    return user ? user.rol.nombre : null;
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
