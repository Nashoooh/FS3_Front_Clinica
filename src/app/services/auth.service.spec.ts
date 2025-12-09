import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Usuario, LoginResponse } from '../models/usuario.model';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockLoginResponse: LoginResponse = {
    token: 'fake-jwt-token',
    id: 1,
    email: 'test@email.com',
    nombre: 'Test User',
    rut: '12345678-9',
    rolId: 1,
    rolNombre: 'Paciente'
  };

  const mockUsuario: Usuario = {
    id: 1,
    nombre: 'Test',
    apellido: 'User',
    email: 'test@email.com',
    rut: '12345678-9',
    rol: { id: 1, nombre: 'Paciente' }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Limpiar sessionStorage antes de cada prueba
    sessionStorage.clear();
  });

  afterEach(() => {
    // Limpiar requests pendientes y sesión
    const pending = httpMock.match(() => true);
    pending.forEach(req => req.flush({}, { status: 404, statusText: 'Not Found' }));
    httpMock.verify();
    sessionStorage.clear();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe inicializar con usuario null', () => {
    expect(service.currentUserValue).toBeNull();
  });

  it('debe hacer login exitosamente', () => {
    service.login('test@email.com', '123456').subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
      expect(sessionStorage.getItem('token')).toBe('fake-jwt-token');
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/usuarios/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@email.com', password: '123456' });
    req.flush(mockLoginResponse);
  });

  it('debe registrar usuario exitosamente', () => {
    const registroData = {
      nombre: 'Test',
      apellido: 'User',
      email: 'test@email.com',
      password: '123456',
      rut: '12345678-9',
      rol: { id: 1, nombre: 'Paciente' }
    };

    service.register(registroData).subscribe(response => {
      expect(response).toEqual(mockUsuario);
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/usuarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registroData);
    req.flush(mockUsuario);
  });

  it('debe verificar si email existe', () => {
    service.checkEmailExists('test@email.com').subscribe(exists => {
      expect(exists).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/usuarios/verify-email`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@email.com' });
    req.flush({ exists: true });
  });

  it('debe resetear contraseña exitosamente', () => {
    const resetResponse = { success: true, message: 'Contraseña actualizada correctamente' };

    service.resetPassword('test@email.com', 'nueva123').subscribe(response => {
      expect(response).toEqual(resetResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/usuarios/change-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@email.com', newPassword: 'nueva123' });
    req.flush(resetResponse);
  });

  it('debe cargar usuario actual cuando hay token', () => {
    sessionStorage.setItem('token', 'fake-token');
    
    service.loadCurrentUser().subscribe(usuario => {
      expect(usuario).toEqual(mockUsuario);
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/usuarios/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsuario);
  });

  it('debe retornar null cuando no hay token', () => {
    service.loadCurrentUser().subscribe(usuario => {
      expect(usuario).toBeNull();
    });

    httpMock.expectNone(`${environment.apiUsuarios}/usuarios/me`);
  });

  it('debe hacer logout correctamente', () => {
    // Simular que hay un usuario logueado
    sessionStorage.setItem('token', 'fake-token');
    spyOn(service['currentUserSubject'], 'next');

    service.logout();

    expect(sessionStorage.getItem('token')).toBeNull();
    expect(service['currentUserSubject'].next).toHaveBeenCalledWith(null);
  });

  it('debe verificar si usuario está logueado', () => {
    // Sin token
    expect(service.isLoggedIn()).toBeFalse();

    // Con token
    sessionStorage.setItem('token', 'fake-token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('debe obtener rol del usuario', () => {
    expect(service.getRole()).toBeNull();
    expect(service.getRoleName()).toBeNull();

    // Simular usuario logueado
    service['currentUserSubject'].next(mockUsuario);
    
    expect(service.getRole()).toBe(1);
    expect(service.getRoleName()).toBe('Paciente');
  });

  it('debe manejar error en login', () => {
    service.login('test@email.com', 'wrong-password').subscribe({
      next: () => fail('Debería haber fallado'),
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/usuarios/login`);
    req.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('debe manejar error en registro', () => {
    const registroData = {
      nombre: 'Test',
      email: 'test@email.com',
      password: '123456'
    };

    service.register(registroData).subscribe({
      next: () => fail('Debería haber fallado'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/usuarios`);
    req.flush({ message: 'Email ya existe' }, { status: 400, statusText: 'Bad Request' });
  });

  it('debe limpiar usuario cuando falla cargar perfil', () => {
    sessionStorage.setItem('token', 'invalid-token');

    service.loadCurrentUser().subscribe(result => {
      expect(result).toBeNull();
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(service.currentUserValue).toBeNull();
    });

    const req = httpMock.expectOne(`${environment.apiUsuarios}/usuarios/me`);
    req.flush({ message: 'Token inválido' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('debe actualizar currentUser cuando se carga perfil exitosamente', () => {
    sessionStorage.setItem('token', 'fake-token');
    
    service.loadCurrentUser().subscribe();

    const req = httpMock.expectOne(`${environment.apiUsuarios}/usuarios/me`);
    req.flush(mockUsuario);

    expect(service.currentUserValue).toEqual(mockUsuario);
  });
});
