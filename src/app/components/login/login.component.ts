import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        this.loading = false;
        
        // Redirigir según el rol que viene en la respuesta
        if (response.rol === 1) {
          this.router.navigate(['/home-paciente']);
        } else if (response.rol === 2) {
          this.router.navigate(['/home-trabajador']);
        } else {
          // Si el rol no es reconocido, cerrar sesión
          this.authService.logout();
          this.errorMessage = 'Rol de usuario no reconocido.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Credenciales inválidas. Por favor, intenta nuevamente.';
        console.error('❌ Error de login:', error);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/recuperar-password']);
  }
}
