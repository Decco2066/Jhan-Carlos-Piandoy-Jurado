import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((module) => module.Login),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/registro/registro.component').then((module) => module.Registro),
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/gestion-usuarios/gestion-usuarios.component').then(
        (module) => module.GestionUsuarios,
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
