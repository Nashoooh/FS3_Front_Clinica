import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario con campos email y password', () => {
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('debe validar email requerido', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    
    expect(emailControl?.hasError('required')).toBeTrue();
  });

  it('debe validar formato de email', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('email-invalido');
    
    expect(emailControl?.hasError('email')).toBeTrue();
    
    emailControl?.setValue('test@email.com');
    
    expect(emailControl?.hasError('email')).toBeFalse();
  });

  it('debe validar password requerido', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('');
    
    expect(passwordControl?.hasError('required')).toBeTrue();
  });

  it('debe validar longitud mínima de password', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('123');
    
    expect(passwordControl?.hasError('minlength')).toBeTrue();
    
    passwordControl?.setValue('123456');
    
    expect(passwordControl?.hasError('minlength')).toBeFalse();
  });

  it('no debe enviar formulario si es inválido', () => {
    component.loginForm.patchValue({
      email: '',
      password: ''
    });

    component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('debe hacer login exitoso y navegar a home-paciente para rol 1', () => {
    const mockResponse = {
      id: 1,
      email: 'test@email.com',
      nombre: 'Test User',
      rut: '12345678-9',
      rolId: 1,
      rolNombre: 'Paciente',
      token: 'fake-token'
    };

    component.loginForm.patchValue({
      email: 'test@email.com',
      password: '123456'
    });

    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(mockAuthService.login).toHaveBeenCalledWith('test@email.com', '123456');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home-paciente']);
  });

  it('debe hacer login exitoso y navegar a home-trabajador para rol 2', () => {
    const mockResponse = {
      id: 1,
      email: 'test@email.com',
      nombre: 'Test User',
      rut: '12345678-9',
      rolId: 2,
      rolNombre: 'Trabajador',
      token: 'fake-token'
    };

    component.loginForm.patchValue({
      email: 'test@email.com',
      password: '123456'
    });

    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(mockAuthService.login).toHaveBeenCalledWith('test@email.com', '123456');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home-trabajador']);
  });

  it('debe manejar rol desconocido y cerrar sesión', () => {
    const mockResponse = {
      id: 1,
      email: 'test@email.com',
      nombre: 'Test User',
      rut: '12345678-9',
      rolId: 99, // Rol desconocido
      rolNombre: 'Desconocido',
      token: 'fake-token'
    };

    component.loginForm.patchValue({
      email: 'test@email.com',
      password: '123456'
    });

    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(component.errorMessage).toContain('Rol de usuario no reconocido');
  });

  it('debe manejar error de login', () => {
    component.loginForm.patchValue({
      email: 'test@email.com',
      password: '123456'
    });

    mockAuthService.login.and.returnValue(throwError(() => new Error('Login failed')));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('Credenciales inválidas');
  });

  it('debe navegar a registro cuando se llama goToRegister', () => {
    component.goToRegister();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/registro']);
  });

  it('debe navegar a recuperar password cuando se llama goToForgotPassword', () => {
    component.goToForgotPassword();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/recuperar-password']);
  });

  it('debe limpiar mensaje de error al enviar formulario', () => {
    component.errorMessage = 'Error previo';
    
    component.loginForm.patchValue({
      email: 'test@email.com',
      password: '123456'
    });

    mockAuthService.login.and.returnValue(of({
      id: 1,
      email: 'test@email.com',
      nombre: 'Test User',
      rut: '12345678-9',
      rolId: 1,
      rolNombre: 'Paciente',
      token: 'fake-token'
    }));

    component.onSubmit();

    expect(component.errorMessage).toBe('');
  });
});
