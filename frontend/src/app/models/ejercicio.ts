export interface Ejercicio {
  id?: number;
  nombre: string;
  descripcion?: string;
  tipo: string;
  imagen_url?: string | null;
}

export interface RutinaEjercicio {
  id?: number;
  usuario: number; 
  ejercicio: number; 
  ejercicio_nombre?: string; 
  meta_cantidad: number;
  completado: boolean;
  fecha_registro: string;
  es_de_hoy?: boolean;
}
