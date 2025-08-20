import { Routes } from '@angular/router';
import { Perfil } from './perfil/perfil';

export const routes: Routes = [
  { path: 'perfil', component: Perfil },
  { path: '', redirectTo: '/perfil', pathMatch: 'full' },
  { path: '**', redirectTo: 'perfil' },
];
