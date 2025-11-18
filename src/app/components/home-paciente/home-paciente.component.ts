import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CitasService } from '../../services/citas.service';
import { Usuario } from '../../models/usuario.model';
import { Analisis, Laboratorio, SolicitudAnalisis } from '../../models/citas.model';

@Component({
  selector: 'app-home-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-paciente.component.html',
  styleUrl: './home-paciente.component.css'
})
export class HomePacienteComponent implements OnInit {
  usuario: Usuario | null = null;
  currentTime: string = '';

  // Modales
  showSolicitarModal = false;
  showConsultarModal = false;
  showAnularModal = false;

  // Listas de catálogos
  analisisList: Analisis[] = [];
  laboratoriosList: Laboratorio[] = [];
  misSolicitudes: SolicitudAnalisis[] = [];

  // Formulario de solicitud
  nuevaSolicitud = {
    analisisId: 0,
    laboratorioId: 0,
    fecha: ''
  };

  // Estados de carga y mensajes
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private citasService: CitasService
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser.subscribe(user => {
      this.usuario = user;
      console.log('👤 Usuario en home-paciente:', user);
    });
    
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ========== MODAL SOLICITAR EXAMEN ==========
  solicitarExamen(): void {
    this.showSolicitarModal = true;
    this.cargarCatalogos();
    this.resetSolicitudForm();
    this.clearMessages();
  }

  closeSolicitarModal(): void {
    this.showSolicitarModal = false;
    this.resetSolicitudForm();
    this.clearMessages();
  }

  cargarCatalogos(): void {
    this.loading = true;
    Promise.all([
      this.citasService.getAnalisis().toPromise(),
      this.citasService.getLaboratorios().toPromise()
    ]).then(([analisis, laboratorios]) => {
      this.analisisList = analisis || [];
      this.laboratoriosList = laboratorios || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error al cargar catálogos:', error);
      this.errorMessage = 'Error al cargar los datos';
      this.loading = false;
    });
  }

  resetSolicitudForm(): void {
    this.nuevaSolicitud = {
      analisisId: 0,
      laboratorioId: 0,
      fecha: ''
    };
  }

  enviarSolicitud(): void {
    if (!this.usuario?.id) {
      this.errorMessage = 'Usuario no identificado';
      return;
    }

    if (!this.nuevaSolicitud.analisisId || !this.nuevaSolicitud.laboratorioId || 
        !this.nuevaSolicitud.fecha) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.clearMessages();

    // El backend espera objetos anidados para laboratorio y analisis
    const solicitud: any = {
      usuarioId: this.usuario.id,
      laboratorio: { id: parseInt(this.nuevaSolicitud.laboratorioId.toString()) },
      analisis: { id: parseInt(this.nuevaSolicitud.analisisId.toString()) },
      fechaSolicitud: this.nuevaSolicitud.fecha,
      estado: 'pendiente'
    };

    console.log('📤 Enviando solicitud:', solicitud);

    this.citasService.createSolicitud(solicitud).subscribe({
      next: () => {
        this.successMessage = 'Solicitud de examen creada exitosamente';
        this.loading = false;
        setTimeout(() => {
          this.closeSolicitarModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Error al crear solicitud:', error);
        this.errorMessage = error.error?.error || 'Error al crear la solicitud';
        this.loading = false;
      }
    });
  }

  // ========== MODAL CONSULTAR RESERVAS ==========
  consultarExamenes(): void {
    this.showConsultarModal = true;
    this.cargarMisSolicitudes();
    this.clearMessages();
  }

  closeConsultarModal(): void {
    this.showConsultarModal = false;
    this.clearMessages();
  }

  cargarMisSolicitudes(): void {
    if (!this.usuario?.id) return;

    this.loading = true;
    this.citasService.getSolicitudes().subscribe({
      next: (solicitudes) => {
        // Filtrar solo las solicitudes del usuario actual
        this.misSolicitudes = solicitudes.filter(s => s.usuarioId === this.usuario?.id);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
        this.errorMessage = 'Error al cargar las reservas';
        this.loading = false;
      }
    });
  }

  // ========== MODAL ANULAR RESERVAS ==========
  cancelarExamen(): void {
    this.showAnularModal = true;
    this.cargarMisSolicitudes();
    this.clearMessages();
  }

  closeAnularModal(): void {
    this.showAnularModal = false;
    this.clearMessages();
  }

  anularSolicitud(id: number | undefined): void {
    if (!id) {
      this.errorMessage = 'ID de solicitud inválido';
      return;
    }

    if (!confirm('¿Estás seguro de anular esta reserva?')) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.citasService.deleteSolicitud(id).subscribe({
      next: () => {
        this.successMessage = 'Reserva anulada exitosamente';
        this.cargarMisSolicitudes();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al anular solicitud:', error);
        this.errorMessage = 'Error al anular la reserva';
        this.loading = false;
      }
    });
  }

  // ========== MÉTODOS AUXILIARES ==========
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getNombreAnalisis(id: number): string {
    const analisis = this.analisisList.find(a => a.id === id);
    return analisis?.nombre || 'Desconocido';
  }

  getNombreLaboratorio(id: number): string {
    const lab = this.laboratoriosList.find(l => l.id === id);
    return lab?.nombre || 'Desconocido';
  }

  verResultados(): void {
    // TODO: Implementar navegación a resultados
    console.log('Navegando a resultados...');
  }

  verHistorial(): void {
    // TODO: Implementar navegación a historial
    console.log('Navegando a historial...');
  }

  editarPerfil(): void {
    // TODO: Implementar navegación a perfil
    console.log('Navegando a perfil...');
  }
}
