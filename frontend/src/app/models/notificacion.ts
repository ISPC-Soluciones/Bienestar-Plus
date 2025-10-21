


export type NotificacionEstado = 'pendiente' | 'enviado' | 'leido';

export interface Notificacion {

  id: number; 
  usuario: number; 

  mensaje: string; 

  estado: NotificacionEstado; 

  enviado: string; 

  leido: string | null; 
}