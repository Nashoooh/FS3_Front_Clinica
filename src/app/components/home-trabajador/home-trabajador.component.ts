import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CitasService } from '../../services/citas.service';
import { Usuario } from '../../models/usuario.model';
import { Analisis, Laboratorio } from '../../models/citas.model';

@Component({
  selector: 'app-home-trabajador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-trabajador.component.html',
  styleUrl: './home-trabajador.component.css'
})
export class HomeTrabajadorComponent implements OnInit {
  usuario: Usuario | null = null;
  currentTime: string = '';

  // Modales
  showAnalisisModal = false;
  showLaboratoriosModal = false;

  // Análisis
  analisisActiveTab: 'list' | 'create' | 'search' = 'list';
  analisisList: Analisis[] = [];
  currentAnalisis: Analisis = { id: 0, nombre: '', descripcion: '' };
  searchedAnalisis: Analisis | null = null;
  searchAnalisisId: number | null = null;
  loadingAnalisis = false;
  isEditingAnalisis = false;
  analisisSuccessMessage = '';
  analisisErrorMessage = '';

  // Laboratorios
  laboratoriosActiveTab: 'list' | 'create' | 'search' = 'list';
  laboratoriosList: Laboratorio[] = [];
  currentLaboratorio: Laboratorio = { id: 0, nombre: '', direccion: '' };
  searchedLaboratorio: Laboratorio | null = null;
  searchLaboratorioId: number | null = null;
  loadingLaboratorios = false;
  isEditingLaboratorio = false;
  laboratoriosSuccessMessage = '';
  laboratoriosErrorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private citasService: CitasService
  ) {}

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser.subscribe(user => {
      this.usuario = user;
      console.log('👤 Usuario en home-trabajador:', user);
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

  // Métodos para futuras funcionalidades
  gestionarPacientes(): void {
    // TODO: Implementar navegación a gestión de pacientes
    console.log('Navegando a gestión de pacientes...');
  }

  gestionarCitas(): void {
    // TODO: Implementar navegación a gestión de citas
    console.log('Navegando a gestión de citas...');
  }

  gestionarExamenes(): void {
    // TODO: Implementar navegación a gestión de exámenes
    console.log('Navegando a gestión de exámenes...');
  }

  // ========== ANÁLISIS ==========
  gestionarAnalisis(): void {
    this.showAnalisisModal = true;
    this.analisisActiveTab = 'list';
    this.loadAnalisis();
  }

  closeAnalisisModal(): void {
    this.showAnalisisModal = false;
    this.resetAnalisisForm();
    this.clearAnalisisMessages();
  }

  loadAnalisis(): void {
    this.loadingAnalisis = true;
    this.clearAnalisisMessages();
    this.citasService.getAnalisis().subscribe({
      next: (data) => {
        this.analisisList = data;
        this.loadingAnalisis = false;
      },
      error: (error) => {
        console.error('Error al cargar análisis:', error);
        this.analisisErrorMessage = 'Error al cargar los análisis';
        this.loadingAnalisis = false;
      }
    });
  }

  resetAnalisisForm(): void {
    this.currentAnalisis = { id: 0, nombre: '', descripcion: '' };
    this.isEditingAnalisis = false;
    this.searchedAnalisis = null;
  }

  editAnalisis(analisis: Analisis): void {
    this.currentAnalisis = { ...analisis };
    this.isEditingAnalisis = true;
    this.analisisActiveTab = 'create';
    this.clearAnalisisMessages();
  }

  saveAnalisis(): void {
    this.loadingAnalisis = true;
    this.clearAnalisisMessages();

    if (this.isEditingAnalisis && this.currentAnalisis.id) {
      this.citasService.updateAnalisis(this.currentAnalisis.id, this.currentAnalisis).subscribe({
        next: () => {
          this.analisisSuccessMessage = 'Análisis actualizado exitosamente';
          this.loadAnalisis();
          this.resetAnalisisForm();
          this.analisisActiveTab = 'list';
          this.loadingAnalisis = false;
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.analisisErrorMessage = 'Error al actualizar el análisis';
          this.loadingAnalisis = false;
        }
      });
    } else {
      this.citasService.createAnalisis(this.currentAnalisis).subscribe({
        next: () => {
          this.analisisSuccessMessage = 'Análisis creado exitosamente';
          this.loadAnalisis();
          this.resetAnalisisForm();
          this.analisisActiveTab = 'list';
          this.loadingAnalisis = false;
        },
        error: (error) => {
          console.error('Error al crear:', error);
          this.analisisErrorMessage = 'Error al crear el análisis';
          this.loadingAnalisis = false;
        }
      });
    }
  }

  deleteAnalisis(id: number): void {
    if (confirm('¿Estás seguro de eliminar este análisis?')) {
      this.loadingAnalisis = true;
      this.clearAnalisisMessages();
      this.citasService.deleteAnalisis(id).subscribe({
        next: () => {
          this.analisisSuccessMessage = 'Análisis eliminado exitosamente';
          this.loadAnalisis();
          this.searchedAnalisis = null;
          this.loadingAnalisis = false;
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          this.analisisErrorMessage = 'Error al eliminar el análisis';
          this.loadingAnalisis = false;
        }
      });
    }
  }

  searchAnalisisById(): void {
    if (!this.searchAnalisisId) return;
    
    this.loadingAnalisis = true;
    this.clearAnalisisMessages();
    this.citasService.getAnalisisById(this.searchAnalisisId).subscribe({
      next: (data) => {
        this.searchedAnalisis = data;
        this.loadingAnalisis = false;
      },
      error: (error) => {
        console.error('Error al buscar:', error);
        this.analisisErrorMessage = 'No se encontró el análisis con ese ID';
        this.searchedAnalisis = null;
        this.loadingAnalisis = false;
      }
    });
  }

  clearAnalisisMessages(): void {
    this.analisisSuccessMessage = '';
    this.analisisErrorMessage = '';
  }

  // ========== LABORATORIOS ==========
  gestionarLaboratorios(): void {
    this.showLaboratoriosModal = true;
    this.laboratoriosActiveTab = 'list';
    this.loadLaboratorios();
  }

  closeLaboratoriosModal(): void {
    this.showLaboratoriosModal = false;
    this.resetLaboratorioForm();
    this.clearLaboratoriosMessages();
  }

  loadLaboratorios(): void {
    this.loadingLaboratorios = true;
    this.clearLaboratoriosMessages();
    this.citasService.getLaboratorios().subscribe({
      next: (data) => {
        this.laboratoriosList = data;
        this.loadingLaboratorios = false;
      },
      error: (error) => {
        console.error('Error al cargar laboratorios:', error);
        this.laboratoriosErrorMessage = 'Error al cargar los laboratorios';
        this.loadingLaboratorios = false;
      }
    });
  }

  resetLaboratorioForm(): void {
    this.currentLaboratorio = { id: 0, nombre: '', direccion: '' };
    this.isEditingLaboratorio = false;
    this.searchedLaboratorio = null;
  }

  editLaboratorio(lab: Laboratorio): void {
    this.currentLaboratorio = { ...lab };
    this.isEditingLaboratorio = true;
    this.laboratoriosActiveTab = 'create';
    this.clearLaboratoriosMessages();
  }

  saveLaboratorio(): void {
    this.loadingLaboratorios = true;
    this.clearLaboratoriosMessages();

    if (this.isEditingLaboratorio && this.currentLaboratorio.id) {
      this.citasService.updateLaboratorio(this.currentLaboratorio.id, this.currentLaboratorio).subscribe({
        next: () => {
          this.laboratoriosSuccessMessage = 'Laboratorio actualizado exitosamente';
          this.loadLaboratorios();
          this.resetLaboratorioForm();
          this.laboratoriosActiveTab = 'list';
          this.loadingLaboratorios = false;
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.laboratoriosErrorMessage = 'Error al actualizar el laboratorio';
          this.loadingLaboratorios = false;
        }
      });
    } else {
      this.citasService.createLaboratorio(this.currentLaboratorio).subscribe({
        next: () => {
          this.laboratoriosSuccessMessage = 'Laboratorio creado exitosamente';
          this.loadLaboratorios();
          this.resetLaboratorioForm();
          this.laboratoriosActiveTab = 'list';
          this.loadingLaboratorios = false;
        },
        error: (error) => {
          console.error('Error al crear:', error);
          this.laboratoriosErrorMessage = 'Error al crear el laboratorio';
          this.loadingLaboratorios = false;
        }
      });
    }
  }

  deleteLaboratorio(id: number): void {
    if (confirm('¿Estás seguro de eliminar este laboratorio?')) {
      this.loadingLaboratorios = true;
      this.clearLaboratoriosMessages();
      this.citasService.deleteLaboratorio(id).subscribe({
        next: () => {
          this.laboratoriosSuccessMessage = 'Laboratorio eliminado exitosamente';
          this.loadLaboratorios();
          this.searchedLaboratorio = null;
          this.loadingLaboratorios = false;
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          this.laboratoriosErrorMessage = 'Error al eliminar el laboratorio';
          this.loadingLaboratorios = false;
        }
      });
    }
  }

  searchLaboratorioById(): void {
    if (!this.searchLaboratorioId) return;
    
    this.loadingLaboratorios = true;
    this.clearLaboratoriosMessages();
    this.citasService.getLaboratorioById(this.searchLaboratorioId).subscribe({
      next: (data) => {
        this.searchedLaboratorio = data;
        this.loadingLaboratorios = false;
      },
      error: (error) => {
        console.error('Error al buscar:', error);
        this.laboratoriosErrorMessage = 'No se encontró el laboratorio con ese ID';
        this.searchedLaboratorio = null;
        this.loadingLaboratorios = false;
      }
    });
  }

  clearLaboratoriosMessages(): void {
    this.laboratoriosSuccessMessage = '';
    this.laboratoriosErrorMessage = '';
  }

  // ========== OTROS MÉTODOS ==========
  asignarExamenes(): void {
    // TODO: Implementar navegación a asignación de exámenes
    console.log('Navegando a asignación de exámenes...');
  }

  verReportes(): void {
    // TODO: Implementar navegación a reportes
    console.log('Navegando a reportes...');
  }

  gestionarResultados(): void {
    // TODO: Implementar navegación a gestión de resultados
    console.log('Navegando a gestión de resultados...');
  }

  configuracion(): void {
    // TODO: Implementar configuración del sistema
    console.log('Navegando a configuración...');
  }

  editarPerfil(): void {
    // TODO: Implementar edición de perfil
    console.log('Editando perfil...');
  }
}
