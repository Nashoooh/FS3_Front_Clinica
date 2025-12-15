import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegistroComponent } from './registro.component';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockCatalogosService: jasmine.SpyObj<CatalogosService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockPrevisiones = [
    { id: 1, nombre: 'Fonasa A' },
    { id: 2, nombre: 'Fonasa B' }
  ];

  const mockRoles = [
    { id: 1, nombre: 'Paciente' },
    { id: 2, nombre: 'Trabajador' }
  ];

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const catalogosServiceSpy = jasmine.createSpyObj('CatalogosService', ['getPrevisiones', 'getRoles']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegistroComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: CatalogosService, useValue: catalogosServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockCatalogosService = TestBed.inject(CatalogosService) as jasmine.SpyObj<CatalogosService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Configurar mocks por defecto
    mockCatalogosService.getPrevisiones.and.returnValue(of(mockPrevisiones));
    mockCatalogosService.getRoles.and.returnValue(of(mockRoles));
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario con todos los campos requeridos', () => {
    component.ngOnInit();
    
    expect(component.registroForm.get('nombre')).toBeTruthy();
    expect(component.registroForm.get('apellido')).toBeTruthy();
    expect(component.registroForm.get('email')).toBeTruthy();
    expect(component.registroForm.get('password')).toBeTruthy();
    expect(component.registroForm.get('confirmPassword')).toBeTruthy();
    expect(component.registroForm.get('telefono')).toBeTruthy();
    expect(component.registroForm.get('rut')).toBeTruthy();
    expect(component.registroForm.get('fechaNacimiento')).toBeTruthy();
    expect(component.registroForm.get('genero')).toBeTruthy();
    expect(component.registroForm.get('direccion')).toBeTruthy();
    expect(component.registroForm.get('previsionId')).toBeTruthy();
    expect(component.registroForm.get('rolId')).toBeTruthy();
  });

  it('debe cargar catálogos al inicializar', async () => {
    component.ngOnInit();
    
    // Esperar múltiples ciclos de event loop para que se resuelvan las promesas
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockCatalogosService.getPrevisiones).toHaveBeenCalled();
    expect(mockCatalogosService.getRoles).toHaveBeenCalled();
    expect(component.previsiones).toEqual(mockPrevisiones);
    expect(component.roles).toEqual(mockRoles);
    expect(component.loadingCatalogos).toBeFalse();
  });

  it('debe establecer rol paciente por defecto', async () => {
    component.ngOnInit();
    
    // Esperar múltiples ciclos de event loop para que se resuelvan las promesas
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(component.registroForm.get('rolId')?.value).toBe(1);
  });

  it('debe manejar error al cargar catálogos', async () => {
    mockCatalogosService.getPrevisiones.and.returnValue(throwError(() => new Error('Error')));
    mockCatalogosService.getRoles.and.returnValue(throwError(() => new Error('Error')));

    component.ngOnInit();
    
    // Esperar múltiples ciclos de event loop para que se ejecute el catch
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(component.errorMessage).toContain('Error al cargar la información');
    expect(component.loadingCatalogos).toBeFalse();
  });

  it('debe validar que las contraseñas coincidan', () => {
    component.registroForm.patchValue({
      password: 'Test123',
      confirmPassword: 'Test456'
    });

    const isValid = component.passwordMatchValidator(component.registroForm);
    
    expect(isValid).toEqual({ passwordMismatch: true });
    expect(component.registroForm.get('confirmPassword')?.hasError('passwordMismatch')).toBeTrue();
  });

  it('debe pasar validación cuando las contraseñas coinciden', () => {
    component.registroForm.patchValue({
      password: 'Test123',
      confirmPassword: 'Test123'
    });

    const isValid = component.passwordMatchValidator(component.registroForm);
    
    expect(isValid).toBeNull();
  });

  it('debe marcar campos como tocados si el formulario es inválido al enviar', () => {
    spyOn(component.registroForm, 'markAsTouched');
    
    component.onSubmit();

    expect(component.errorMessage).toContain('completa todos los campos');
  });

  it('debe registrar usuario exitosamente', () => {
    // Configurar formulario válido
    component.ngOnInit();
    component.registroForm.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      password: 'Test123',
      confirmPassword: 'Test123',
      telefono: '987654321',
      rut: '12345678-9',
      fechaNacimiento: '1990-01-01',
      genero: 'M',
      direccion: 'Calle Test 123',
      previsionId: 1,
      rolId: 1
    });

    const mockUsuario = {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      rut: '12345678-9',
      rol: { id: 1, nombre: 'Paciente' }
    };
    mockAuthService.register.and.returnValue(of(mockUsuario));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(component.successMessage).toContain('registrado exitosamente');
    expect(mockAuthService.register).toHaveBeenCalled();
  });

  it('debe manejar error 400 en registro', () => {
    // Configurar formulario válido
    component.ngOnInit();
    component.registroForm.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      password: 'Test123',
      confirmPassword: 'Test123',
      telefono: '987654321',
      rut: '12345678-9',
      fechaNacimiento: '1990-01-01',
      genero: 'M',
      direccion: 'Calle Test 123',
      previsionId: 1,
      rolId: 1
    });

    const error400 = { status: 400, error: { message: 'Email ya registrado' } };
    mockAuthService.register.and.returnValue(throwError(() => error400));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('Email ya registrado');
  });

  it('debe manejar error 409 en registro', () => {
    // Configurar formulario válido
    component.ngOnInit();
    component.registroForm.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      password: 'Test123',
      confirmPassword: 'Test123',
      telefono: '987654321',
      rut: '12345678-9',
      fechaNacimiento: '1990-01-01',
      genero: 'M',
      direccion: 'Calle Test 123',
      previsionId: 1,
      rolId: 1
    });

    const error409 = { status: 409 };
    mockAuthService.register.and.returnValue(throwError(() => error409));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('email o RUT ya está registrado');
  });

  it('debe manejar error genérico en registro', () => {
    // Configurar formulario válido
    component.ngOnInit();
    component.registroForm.patchValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      password: 'Test123',
      confirmPassword: 'Test123',
      telefono: '987654321',
      rut: '12345678-9',
      fechaNacimiento: '1990-01-01',
      genero: 'M',
      direccion: 'Calle Test 123',
      previsionId: 1,
      rolId: 1
    });

    const errorGeneric = { status: 500 };
    mockAuthService.register.and.returnValue(throwError(() => errorGeneric));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('Error al registrar usuario');
  });

  it('debe navegar a login cuando se llama goToLogin', () => {
    component.goToLogin();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe formatear RUT correctamente', () => {
    const mockEvent = {
      target: { value: '123456789' }
    };

    spyOn(component.registroForm, 'patchValue');

    component.formatRut(mockEvent);

    expect(component.registroForm.patchValue).toHaveBeenCalledWith({ rut: '12345678-9' });
  });

  it('debe validar formato de teléfono', () => {
    component.registroForm.get('telefono')?.setValue('123');
    
    expect(component.registroForm.get('telefono')?.hasError('pattern')).toBeTrue();
    
    component.registroForm.get('telefono')?.setValue('987654321');
    
    expect(component.registroForm.get('telefono')?.hasError('pattern')).toBeFalse();
  });

  it('debe validar formato de email', () => {
    component.registroForm.get('email')?.setValue('email-invalido');
    
    expect(component.registroForm.get('email')?.hasError('email')).toBeTrue();
    
    component.registroForm.get('email')?.setValue('test@email.com');
    
    expect(component.registroForm.get('email')?.hasError('email')).toBeFalse();
  });

  it('debe validar contraseña con regla de 4 (mayúscula, minúscula, número, longitud 6)', () => {
    // Contraseña muy corta
    component.registroForm.get('password')?.setValue('Te1');
    expect(component.registroForm.get('password')?.invalid).toBeTrue();
    
    // Contraseña sin mayúscula
    component.registroForm.get('password')?.setValue('test123');
    expect(component.registroForm.get('password')?.invalid).toBeTrue();
    
    // Contraseña sin minúscula
    component.registroForm.get('password')?.setValue('TEST123');
    expect(component.registroForm.get('password')?.invalid).toBeTrue();
    
    // Contraseña sin número
    component.registroForm.get('password')?.setValue('TestTest');
    expect(component.registroForm.get('password')?.invalid).toBeTrue();
    
    // Contraseña válida
    component.registroForm.get('password')?.setValue('Test123');
    expect(component.registroForm.get('password')?.valid).toBeTrue();
    
    // Contraseña válida con símbolos
    component.registroForm.get('password')?.setValue('Test123!@#');
    expect(component.registroForm.get('password')?.valid).toBeTrue();
  });

  it('debe obtener mensaje de error de contraseña', () => {
    component.registroForm.get('password')?.setValue('test');
    component.registroForm.get('password')?.markAsTouched();
    
    const message = component.getPasswordErrorMessage();
    expect(message).toContain('contraseña debe contener');
  });

  it('debe validar formato de RUT', () => {
    component.registroForm.get('rut')?.setValue('12345678');
    
    expect(component.registroForm.get('rut')?.hasError('pattern')).toBeTrue();
    
    component.registroForm.get('rut')?.setValue('12345678-9');
    
    expect(component.registroForm.get('rut')?.hasError('pattern')).toBeFalse();
  });
});
