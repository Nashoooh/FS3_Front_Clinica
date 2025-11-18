import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { HomePacienteComponent } from './components/home-paciente/home-paciente.component';
import { HomeTrabajadorComponent } from './components/home-trabajador/home-trabajador.component';

export const routes: Routes = [
  // Rutas públicas (sin autenticación)
  { path: 'login', component: LoginComponent, title: 'Iniciar Sesión - Clinimed' },
  { path: 'registro', component: RegistroComponent, title: 'Registro - Clinimed' },
  { path: 'recuperar-password', component: RecuperarPasswordComponent, title: 'Recuperar Contraseña - Clinimed' },

  // Ruta por defecto para usuarios no logueados
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas protegidas (requieren autenticación)
  { 
    path: '', 
    canActivate: [AuthGuard],
    children: [
      // Rutas del paciente
      { path: 'home-paciente', component: HomePacienteComponent, title: 'Portal del Paciente - Clinimed' },

      // Rutas del trabajador
      { path: 'home-trabajador', component: HomeTrabajadorComponent, title: 'Portal del Trabajador - Clinimed' },

      // Rutas legacy (mantener por compatibilidad)
      { path: 'agendar-cita', redirectTo: 'paciente/agendar-cita' },
      { path: 'consultar-citas', redirectTo: 'paciente/consultar-citas' },
    ]
  },

  // Wildcard: si ninguna ruta coincide, redirige a login (debe ir al final)
  { path: '**', redirectTo: 'login' }
];
