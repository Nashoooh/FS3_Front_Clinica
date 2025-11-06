import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registroForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,9}$/)]],
      rut: ['', [Validators.required, Validators.pattern(/^[0-9]+-[0-9kK]{1}$/)]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      rol: [1, [Validators.required]] // Por defecto paciente
    }, { validators: this.passwordMatchValidator });
  }

  get f() { return this.registroForm.controls; }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      Object.keys(this.registroForm.controls).forEach(key => {
        const control = this.registroForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.registroForm.value;
    delete formData.confirmPassword; // No enviar confirmPassword al backend

    const usuario: Usuario = {
      ...formData,
      activo: true
    };

    this.authService.register(usuario).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Usuario registrado exitosamente';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al registrar usuario. Por favor, intenta nuevamente.';
        console.error('Error de registro:', error);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  formatRut(event: any): void {
    let value = event.target.value.replace(/[^0-9kK]/g, '');
    if (value.length > 1) {
      value = value.slice(0, -1) + '-' + value.slice(-1);
    }
    this.registroForm.patchValue({ rut: value });
  }
}
