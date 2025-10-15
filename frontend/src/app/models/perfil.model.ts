// src/app/models/perfil.model.ts
export type ID = string | number;

/**
 * Modelo de un hábito (habito)
 */
export interface Habito {
  id: ID;
  nombre: string;
  tipo?: string;
  metaDiaria?: string;
  frecuenciaSemanal?: number;
  activo?: boolean;
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
}

/**
 * Modelo de usuario/perfil.
 */

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

/** DTO para crear usuario (request) */
export interface UsuarioCreateDTO {
  nombre: string;
  email: string;
  telefono:string;
  edad:string;
  genero:string;
  habitos?: ID[] | Habito[];
  avatarUrl?: string;
}

/** DTO para actualizar usuario (patch/put) */
export interface UsuarioUpdateDTO extends Partial<UsuarioCreateDTO> {}
