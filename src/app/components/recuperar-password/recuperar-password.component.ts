import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { passwordStrengthValidator, getPasswordErrorMessage } from '../../validators/password.validator';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent {
  step = 1; // 1: Verificar email, 2: Nueva contraseña
  emailForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  emailToRecover = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get emailF() { return this.emailForm.controls; }
  get passwordF() { return this.passwordForm.controls; }

  getPasswordErrorMessage(): string {
    const passwordControl = this.passwordForm.get('newPassword');
    if (!passwordControl) {
      return '';
    }
    return getPasswordErrorMessage(passwordControl.errors);
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmitEmail(): void {
    if (this.emailForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.emailForm.value.email;

    this.authService.checkEmailExists(email).subscribe({
      next: (exists) => {
        this.loading = false;
        if (exists) {
          this.emailToRecover = email;
          this.step = 2;
          this.successMessage = 'Email verificado correctamente. Ahora puedes establecer una nueva contraseña.';
        } else {
          this.errorMessage = 'El correo electrónico no está registrado en nuestro sistema.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al verificar el correo electrónico. Por favor, intenta nuevamente.';
        console.error('Error al verificar email:', error);
      }
    });
  }

  onSubmitNewPassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        const control = this.passwordForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPassword = this.passwordForm.value.newPassword;

    this.authService.resetPassword(this.emailToRecover, newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = 'Contraseña actualizada correctamente. Serás redirigido al login.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Error al actualizar la contraseña.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al actualizar la contraseña. Por favor, intenta nuevamente.';
        console.error('Error al resetear password:', error);
      }
    });
  }

  goBack(): void {
    if (this.step === 2) {
      this.step = 1;
      this.successMessage = '';
      this.errorMessage = '';
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
