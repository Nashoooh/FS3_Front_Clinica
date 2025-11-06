export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  telefono: string;
  rut: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
  rol: number; // 1: Paciente, 2: Trabajador
  activo?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  usuario: Usuario;
  token?: string;
}
