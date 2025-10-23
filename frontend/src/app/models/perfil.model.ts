
export type ID = string | number;

export interface Habito {
  id: ID;
  nombre: string;
  tipo?: string;
  metaDiaria?: string;
  frecuenciaSemanal?: number;
  activo?: boolean;
  createdAt?: string; 
  updatedAt?: string; 
}


export interface PerfilSalud {
  peso?: number;
  altura?: number;
  genero?: string;
  fecha_nacimiento?: number;
  imc?: number;
}
export interface Usuario {
  id: ID;
  nombre: string;
  email: string;
  telefono:string;
  edad:number;
  genero:string;
  habitosIds?: ID[];
  habitos?: Habito[];
  avatarUrl?: string;
  progreso?: string;
  foto?: string;
  grafico?: string;
  createdAt?: string;
  updatedAt?: string;
  fecha_nacimiento:number
  peso?: number;         
  altura?: number;   
  perfil_salud?: PerfilSalud;

}

export interface UsuarioCreateDTO {
  nombre: string;
  email: string;
  telefono:string;
  edad:string;
  genero:string;
  habitos?: ID[] | Habito[];
  avatarUrl?: string;
}

export interface UsuarioUpdateDTO extends Partial<UsuarioCreateDTO> {}
