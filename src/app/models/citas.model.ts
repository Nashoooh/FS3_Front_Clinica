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
  fechaSolicitud: string; // Formato ISO: YYYY-MM-DDTHH:mm:ss
  estado?: string; // pendiente, completado, cancelado
  usuario?: any; // Objeto usuario completo del backend
  analisis?: any; // Objeto análisis completo del backend
  laboratorio?: any; // Objeto laboratorio completo del backend
}

// Para mostrar la información de forma más amigable
export interface SolicitudAnalisisDetallada extends SolicitudAnalisis {
  nombreAnalisis?: string;
  nombreLaboratorio?: string;
}
