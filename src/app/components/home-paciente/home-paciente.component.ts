import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-home-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-paciente.component.html',
  styleUrl: './home-paciente.component.css'
})
export class HomePacienteComponent implements OnInit {
  usuario: Usuario | null = null;
  currentTime: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.currentUserValue;
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
  verCitas(): void {
    // TODO: Implementar navegación a citas
    console.log('Navegando a citas...');
  }

  agendarCita(): void {
    // TODO: Implementar navegación a agendar cita
    console.log('Navegando a agendar cita...');
  }

  verExamenes(): void {
    // TODO: Implementar navegación a exámenes
    console.log('Navegando a exámenes...');
  }

  verResultados(): void {
    // TODO: Implementar navegación a resultados
    console.log('Navegando a resultados...');
  }

  editarPerfil(): void {
    // TODO: Implementar edición de perfil
    console.log('Editando perfil...');
  }

  verHistorial(): void {
    // TODO: Implementar historial médico
    console.log('Navegando a historial médico...');
  }
}
