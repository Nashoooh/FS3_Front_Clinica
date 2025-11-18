export interface Usuario {
  id?: number;
  nombre: string;
  apellido?: string;
  email: string;
  password?: string;
  telefono?: string;
  rut: string;
  fechaNacimiento?: string;
  genero?: string;
  direccion?: string;
  rol: {
    id: number;
    nombre: string;
  };
  activo?: boolean;
  prevision?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  nombre: string;
  rut: string;
  rolId: number; // Corregido de 'rol' a 'rolId'
  rolNombre: string;
}
