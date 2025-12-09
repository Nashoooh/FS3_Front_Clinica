import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RecuperarPasswordComponent } from './recuperar-password.component';
import { AuthService } from '../../services/auth.service';

describe('RecuperarPasswordComponent', () => {
  let component: RecuperarPasswordComponent;
  let fixture: ComponentFixture<RecuperarPasswordComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['checkEmailExists', 'resetPassword']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RecuperarPasswordComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperarPasswordComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar en paso 1', () => {
    expect(component.step).toBe(1);
  });

  it('debe inicializar formularios correctamente', () => {
    expect(component.emailForm.get('email')).toBeTruthy();
    expect(component.passwordForm.get('newPassword')).toBeTruthy();
    expect(component.passwordForm.get('confirmPassword')).toBeTruthy();
  });

  it('debe validar email requerido', () => {
    const emailControl = component.emailForm.get('email');
    emailControl?.setValue('');
    
    expect(emailControl?.hasError('required')).toBeTrue();
  });

  it('debe validar formato de email', () => {
    const emailControl = component.emailForm.get('email');
    emailControl?.setValue('email-invalido');
    
    expect(emailControl?.hasError('email')).toBeTrue();
    
    emailControl?.setValue('test@email.com');
    
    expect(emailControl?.hasError('email')).toBeFalse();
  });

  it('debe validar longitud mínima de nueva contraseña', () => {
    const passwordControl = component.passwordForm.get('newPassword');
    passwordControl?.setValue('123');
    
    expect(passwordControl?.hasError('minlength')).toBeTrue();
    
    passwordControl?.setValue('123456');
    
    expect(passwordControl?.hasError('minlength')).toBeFalse();
  });

  it('debe validar que las contraseñas coincidan', () => {
    component.passwordForm.patchValue({
      newPassword: '123456',
      confirmPassword: '654321'
    });

    const isValid = component.passwordMatchValidator(component.passwordForm);
    
    expect(isValid).toEqual({ passwordMismatch: true });
    expect(component.passwordForm.get('confirmPassword')?.hasError('passwordMismatch')).toBeTrue();
  });

  it('debe pasar a paso 2 cuando email existe', () => {
    component.emailForm.patchValue({
      email: 'test@email.com'
    });

    mockAuthService.checkEmailExists.and.returnValue(of(true));

    component.onSubmitEmail();

    expect(component.loading).toBeFalse();
    expect(component.step).toBe(2);
    expect(component.emailToRecover).toBe('test@email.com');
    expect(component.successMessage).toContain('Email verificado correctamente');
  });

  it('debe mostrar error cuando email no existe', () => {
    component.emailForm.patchValue({
      email: 'test@email.com'
    });

    mockAuthService.checkEmailExists.and.returnValue(of(false));

    component.onSubmitEmail();

    expect(component.loading).toBeFalse();
    expect(component.step).toBe(1);
    expect(component.errorMessage).toContain('no está registrado');
  });

  it('debe manejar error al verificar email', () => {
    component.emailForm.patchValue({
      email: 'test@email.com'
    });

    mockAuthService.checkEmailExists.and.returnValue(throwError(() => new Error('Error')));

    component.onSubmitEmail();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('Error al verificar');
  });

  it('no debe enviar email si formulario es inválido', () => {
    component.emailForm.patchValue({
      email: ''
    });

    component.onSubmitEmail();

    expect(mockAuthService.checkEmailExists).not.toHaveBeenCalled();
  });

  it('debe resetear contraseña exitosamente', () => {
    component.step = 2;
    component.emailToRecover = 'test@email.com';
    component.passwordForm.patchValue({
      newPassword: '123456',
      confirmPassword: '123456'
    });

    mockAuthService.resetPassword.and.returnValue(of({ success: true, message: 'Contraseña actualizada' }));

    component.onSubmitNewPassword();

    expect(component.loading).toBeFalse();
    expect(component.successMessage).toContain('Contraseña actualizada correctamente');
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test@email.com', '123456');
  });

  it('debe manejar error al resetear contraseña desde respuesta', () => {
    component.step = 2;
    component.emailToRecover = 'test@email.com';
    component.passwordForm.patchValue({
      newPassword: '123456',
      confirmPassword: '123456'
    });

    mockAuthService.resetPassword.and.returnValue(of({ success: false, message: 'Error personalizado' }));

    component.onSubmitNewPassword();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Error personalizado');
  });

  it('debe manejar error de conexión al resetear contraseña', () => {
    component.step = 2;
    component.emailToRecover = 'test@email.com';
    component.passwordForm.patchValue({
      newPassword: '123456',
      confirmPassword: '123456'
    });

    mockAuthService.resetPassword.and.returnValue(throwError(() => new Error('Network error')));

    component.onSubmitNewPassword();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toContain('Error al actualizar la contraseña');
  });

  it('no debe enviar nueva contraseña si formulario es inválido', () => {
    component.step = 2;
    component.passwordForm.patchValue({
      newPassword: '',
      confirmPassword: ''
    });

    spyOn(component.passwordForm, 'markAsTouched');

    component.onSubmitNewPassword();

    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  it('debe volver a paso 1 cuando está en paso 2', () => {
    component.step = 2;
    component.successMessage = 'Mensaje previo';
    component.errorMessage = 'Error previo';

    component.goBack();

    expect(component.step).toBe(1);
    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('debe navegar a login cuando está en paso 1', () => {
    component.step = 1;

    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe navegar a login cuando se llama goToLogin', () => {
    component.goToLogin();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
