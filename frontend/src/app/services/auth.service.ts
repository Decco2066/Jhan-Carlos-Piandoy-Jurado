import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, Usuario, UsuarioCreate } from '../models/usuario.model';

const TOKEN_STORAGE_KEY = 'hospital_access_token';
const USER_STORAGE_KEY = 'hospital_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(({ access_token, usuario }) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
      }),
    );
  }

  registrar(usuario: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuario);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  obtenerUsuario(): Usuario | null {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as Usuario) : null;
  }

  cerrarSesion(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}
