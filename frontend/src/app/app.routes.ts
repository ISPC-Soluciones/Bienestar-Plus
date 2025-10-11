// app.routes.ts
import { Routes } from '@angular/router';
import { PerfilComponent } from './pages/perfil/perfil';
import { Habitos } from './pages/habitos/habitos';
import { Registro } from './pages/registro/registro';
import { NosotrosComponent } from './pages/nosotros/nosotros';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { PageNotFound } from './pages/page-not-found/page-not-found';
import { Admin } from './pages/admin/admin';
import { AdminGuard } from './guards/admin-guard';
import { Ejercicios } from './pages/admin/ejercicios/ejercicios';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { AdminPerfil } from './pages/admin/admin-perfil/admin-perfil';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'perfil/:id', component: PerfilComponent },
  { path: 'home', component: Home },
  { path: 'habitos', component: Habitos },
  { path: 'registro', component: Registro },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'login', component: Login },
  {
    path: 'admin',
    component: Admin,
    // canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'ejercicios',
        loadComponent: () =>
          import('./pages/admin/ejercicios/ejercicios').then(
            (m) => m.Ejercicios
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/admin/admin-perfil/admin-perfil').then(
            (m) => m.AdminPerfil
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', component: PageNotFound },
];
