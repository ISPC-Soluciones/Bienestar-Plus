/** Opciones que el usuario puede agregar */
export type TipoHidratacion = 'vaso' | 'botella_500' | 'botella_1l';

/** Un registro de agua del día ("Vaso · 250 ml · 16:20"). */
export interface RegistroHidratacion {
  id: number;
  tipo: TipoHidratacion;
  tipo_display: string;
  cantidad_ml: number;
  fecha: string;
  hora: string;
}

/** Lo que devuelve /api/hidratacion/: registros de hoy, total y meta. */
export interface ResumenHidratacion {
  fecha: string;
  meta_ml: number;
  total_ml: number;
  completado: boolean;
  registros: RegistroHidratacion[];
}