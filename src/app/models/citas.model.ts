export interface Analisis {
  id?: number; // Opcional para permitir creación sin ID
  nombre: string;
  descripcion: string;
}

export interface Laboratorio {
  id?: number; // Opcional para permitir creación sin ID
  nombre: string;
  direccion: string;
  telefono?: string;
  ubicacion?: string;
  capacidad?: number;
}

export interface SolicitudAnalisis {
  id?: number;
  usuarioId: number;
  analisisId: number;
  laboratorioId: number;
  fecha: string; // Formato YYYY-MM-DD
  hora: string; // Formato HH:MM
}

// Para mostrar la información de forma más amigable
export interface SolicitudAnalisisDetallada extends SolicitudAnalisis {
  nombreAnalisis?: string;
  nombreLaboratorio?: string;
}
