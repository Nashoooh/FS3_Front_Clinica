import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { HomePacienteComponent } from './components/home-paciente/home-paciente.component';
import { HomeTrabajadorComponent } from './components/home-trabajador/home-trabajador.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Iniciar Sesión - Clinimed' },
  { path: 'registro', component: RegistroComponent, title: 'Registro - Clinimed' },
  { path: 'recuperar-password', component: RecuperarPasswordComponent, title: 'Recuperar Contraseña - Clinimed' },
  { path: 'home-paciente', component: HomePacienteComponent, canActivate: [AuthGuard], title: 'Portal del Paciente - Clinimed' },
  { path: 'home-trabajador', component: HomeTrabajadorComponent, canActivate: [AuthGuard], title: 'Portal del Trabajador - Clinimed' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
