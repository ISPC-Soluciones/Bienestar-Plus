export interface Recurso {
  id?: number;
  usuario?: number;
  descripcion: string;
  tipo: string;
  enlace?: string;
}

export interface RecursosApiResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Recurso[];
}
