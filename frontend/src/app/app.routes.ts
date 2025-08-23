import { Routes } from '@angular/router';
import { Perfil } from './perfil/perfil';
import { Habitos } from './habitos/habitos';
import { Home } from './home/home';
// import { NotFound } from './';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'perfil', component: Perfil },
  { path: 'habitos', component: Habitos },
  { path: '', component: Home  },
  {path:"", redirectTo:"/home", pathMatch:"full" }
  // { path: '**', component: NotFound },
];
