export interface Habito {
    id?: number;
    tipo: string;
    nombre: string;
    metaDiaria: string;
    frecuenciaSemanal: number;
    activo: boolean;
    createdAt?: string;
    updatedAt?: string;
  }