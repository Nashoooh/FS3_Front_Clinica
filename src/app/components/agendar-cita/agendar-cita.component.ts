import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CitasService } from '../../services/citas.service';
import { AuthService } from '../../services/auth.service';
import { Analisis, Laboratorio, SolicitudAnalisis } from '../../models/citas.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agendar-cita.component.html',
  styleUrls: ['./agendar-cita.component.css']
})
export class AgendarCitaComponent implements OnInit {
  citaForm: FormGroup;
  analisis$: Observable<Analisis[]>;
  laboratorios$: Observable<Laboratorio[]>;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private authService: AuthService
  ) {
    this.citaForm = this.fb.group({
      analisisId: ['', Validators.required],
      laboratorioId: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });

    this.analisis$ = this.citasService.getAnalisis();
    this.laboratorios$ = this.citasService.getLaboratorios();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.citaForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.id) {
      this.errorMessage = 'No se pudo obtener la información del usuario. Por favor, inicia sesión de nuevo.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.citaForm.value;
    const nuevaSolicitud: SolicitudAnalisis = {
      usuarioId: currentUser.id,
      analisisId: Number(formValue.analisisId),
      laboratorioId: Number(formValue.laboratorioId),
      fecha: formValue.fecha,
      hora: formValue.hora
    };

    this.citasService.createSolicitud(nuevaSolicitud).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '¡Cita agendada con éxito!';
        this.citaForm.reset();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Ocurrió un error al agendar la cita.';
        console.error('Error al crear la solicitud:', err);
      }
    });
  }
}
