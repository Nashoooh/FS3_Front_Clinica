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

  solicitarExamen(): void {
    this.router.navigate(['/paciente/agendar-cita']);
  }

  consultarExamenes(): void {
    this.router.navigate(['/paciente/consultar-citas']);
  }

  cancelarExamen(): void {
    this.router.navigate(['/paciente/consultar-citas']);
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
