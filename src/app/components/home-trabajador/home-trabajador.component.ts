import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-home-trabajador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-trabajador.component.html',
  styleUrl: './home-trabajador.component.css'
})
export class HomeTrabajadorComponent implements OnInit {
  usuario: Usuario | null = null;
  currentTime: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
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
