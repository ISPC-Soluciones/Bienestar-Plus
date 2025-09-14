export interface Habito {
    id?: number;
    nombre: string;
    tipo: string;
    metaDiaria: string;
    frecuenciaSemanal: number;
    activo: boolean;
    createdAt?: string;
    updatedAt?: string;
  }