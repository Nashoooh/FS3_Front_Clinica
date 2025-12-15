import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
import { Usuario } from '../../models/usuario.model';
import { Prevision, Rol } from '../../models/prevision-rol.model';
import { passwordStrengthValidator, getPasswordErrorMessage } from '../../validators/password.validator';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  previsiones: Prevision[] = [];
  roles: Rol[] = [];
  loadingCatalogos = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private catalogosService: CatalogosService,
    private router: Router
  ) {
    this.registroForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,9}$/)]],
      rut: ['', [Validators.required, Validators.pattern(/^[0-9]+-[0-9kK]{1}$/)]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      previsionId: ['', [Validators.required]],
      rolId: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.loadingCatalogos = true;
    
    // Cargar previsiones y roles en paralelo
    Promise.all([
      this.catalogosService.getPrevisiones().toPromise(),
      this.catalogosService.getRoles().toPromise()
    ]).then(([previsiones, roles]) => {
      this.previsiones = previsiones || [];
      this.roles = roles || [];
      this.loadingCatalogos = false;
      
      // Establecer rol por defecto (Paciente = 1)
      if (this.roles.length > 0) {
        const rolPaciente = this.roles.find(r => r.id === 1);
        if (rolPaciente) {
          this.registroForm.patchValue({ rolId: rolPaciente.id });
        }
      }
    }).catch(error => {
      console.error('Error al cargar catálogos:', error);
      this.errorMessage = 'Error al cargar la información del formulario. Por favor, recarga la página.';
      this.loadingCatalogos = false;
    });
  }

  get f() { return this.registroForm.controls; }

  getPasswordErrorMessage(): string {
    const passwordControl = this.registroForm.get('password');
    if (!passwordControl) {
      return '';
    }
    return getPasswordErrorMessage(passwordControl.errors);
  }

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
      this.errorMessage = 'Por favor, completa todos los campos requeridos correctamente.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.registroForm.value;
    
    // Construir el payload según el backend espera
    const payload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
      rut: formData.rut,
      fechaNacimiento: formData.fechaNacimiento,
      genero: formData.genero,
      direccion: formData.direccion,
      rol: {
        id: parseInt(formData.rolId),
        nombre: this.roles.find(r => r.id === parseInt(formData.rolId))?.nombre || ''
      },
      prevision: {
        id: parseInt(formData.previsionId),
        nombre: this.previsiones.find(p => p.id === parseInt(formData.previsionId))?.nombre || ''
      }
      // No enviamos 'activo' - el backend lo establece automáticamente en true
    };

    this.authService.register(payload as any).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Datos inválidos. Verifica que el email no esté registrado.';
        } else if (error.status === 409) {
          this.errorMessage = 'El email o RUT ya está registrado en el sistema.';
        } else {
          this.errorMessage = 'Error al registrar usuario. Por favor, intenta nuevamente.';
        }
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
