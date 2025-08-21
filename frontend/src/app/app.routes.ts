import { Routes } from '@angular/router';
import { Perfil } from './perfil/perfil';
import { Habitos } from './habitos/habitos';

export const routes: Routes = [
  { path: 'perfil', component: Perfil },
  { path: 'habitos', component: Habitos },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '/' },
];
