export type CargoUsuario = 'Doctor' | 'Especialista' | 'Administrativo';
export type EstadoUsuario = 'Activado' | 'Desactivado';

export interface Usuario {
  id: number;
  identificacion: string;
  nombre: string;
  apellido: string;
  email: string | null;
  cargo: CargoUsuario;
  telefono: string | null;
  nombre_usuario: string;
  estado: EstadoUsuario;
}

export interface UsuarioCreate {
  identificacion: string;
  nombre: string;
  apellido: string;
  email: string | null;
  cargo: CargoUsuario;
  telefono: string | null;
  nombre_usuario: string;
  contrasena: string;
  estado?: EstadoUsuario;
}

export interface UsuarioUpdate {
  identificacion?: string;
  nombre?: string;
  apellido?: string;
  email?: string | null;
  cargo?: CargoUsuario;
  telefono?: string | null;
  nombre_usuario?: string;
  contrasena?: string;
  estado?: EstadoUsuario;
}

export interface LoginRequest {
  identificacion: string;
  contrasena: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}
