export type TipoComida = 'desayuno' | 'almuerzo' | 'merienda' | 'cena' | 'colacion';

export interface ComidaPlan {
  tipo: TipoComida;
  descripcion: string;
  horario: string | null;
}

export interface PlanNutricionalDatos {
  nombre: string;
  objetivo: string;
  notas: string;
  comidas: ComidaPlan[];
}

export interface PlanNutricional extends PlanNutricionalDatos {
  id: number;
  creado: string;
  actualizado: string;
}
