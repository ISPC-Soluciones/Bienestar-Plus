// app.routes.ts
import { Routes } from '@angular/router';
import { PerfilComponent } from './pages/perfil/perfil';
import { Habitos } from './pages/habitos/habitos';
import { Registro } from './pages/registro/registro';
import { NosotrosComponent } from './pages/nosotros/nosotros';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'perfil/:id', component: PerfilComponent },
  { path: 'home', component: Home },
  { path: 'habitos', component: Habitos },
  { path: 'registro', component: Registro },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'login', component: Login },
];
