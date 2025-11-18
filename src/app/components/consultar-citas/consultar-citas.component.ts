import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService } from '../../services/citas.service';
import { AuthService } from '../../services/auth.service';
import { SolicitudAnalisis, SolicitudAnalisisDetallada, Analisis, Laboratorio } from '../../models/citas.model';
import { Observable, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-consultar-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultar-citas.component.html',
  styleUrls: ['./consultar-citas.component.css']
})
export class ConsultarCitasComponent implements OnInit {
  citas$: Observable<SolicitudAnalisisDetallada[]> = of([]);
  loading = true;
  error = '';

  constructor(
    private citasService: CitasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.id) {
      this.error = 'No se pudo obtener la información del usuario.';
      this.loading = false;
      return;
    }

    this.citas$ = forkJoin({
      solicitudes: this.citasService.getSolicitudes(),
      analisis: this.citasService.getAnalisis(),
      laboratorios: this.citasService.getLaboratorios()
    }).pipe(
      map(({ solicitudes, analisis, laboratorios }) => {
        const analisisMap = new Map(analisis.map(a => [a.id, a.nombre]));
        const laboratoriosMap = new Map(laboratorios.map(l => [l.id, l.nombre]));

        return solicitudes
          .filter(s => s.usuarioId === currentUser.id)
          .map(s => ({
            ...s,
            nombreAnalisis: analisisMap.get(s.analisisId) || 'No disponible',
            nombreLaboratorio: laboratoriosMap.get(s.laboratorioId) || 'No disponible'
          }));
      })
    );

    this.citas$.subscribe({
      next: () => this.loading = false,
      error: (err) => {
        this.error = 'Error al cargar las citas.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancelarCita(id: number): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      return;
    }

    this.citasService.deleteSolicitud(id).subscribe({
      next: () => {
        alert('Cita cancelada con éxito.');
        this.ngOnInit(); // Recargar la lista de citas
      },
      error: (err) => {
        alert('Error al cancelar la cita.');
        console.error(err);
      }
    });
  }
}
