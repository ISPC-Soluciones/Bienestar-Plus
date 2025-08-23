import { Routes } from '@angular/router';
import { Perfil } from './perfil/perfil';
import { Habitos } from './habitos/habitos';
import { Home } from './home/home';
import { Registro } from './registro/registro';
// import { NotFound } from './';

export const routes: Routes = [
  { path: 'perfil', component: Perfil },
  { path: 'habitos', component: Habitos },
  {path: 'registro', component: Registro },
  { path: '', component: Home  },
  {path:"", redirectTo:"/home", pathMatch:"full"}
  // { path: '**', component: NotFound },
];
