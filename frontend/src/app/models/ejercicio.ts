export interface Ejercicio {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
}

// Modelo para la rutina del usuario
export interface RutinaEjercicio {
  id?: number;
  usuario: number; // ID del usuario (clave para POST)
  ejercicio: number; // ID del ejercicio (clave para POST)
  ejercicio_nombre?: string; // Nombre para visualización (solo en GET)
  meta_cantidad: number;
  completado: boolean;
  fecha_registro: string;
}
