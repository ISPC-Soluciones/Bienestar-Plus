import { Routes } from '@angular/router';
import { Perfil } from './perfil/perfil';
import { Habitos } from './habitos/habitos';
import { Login } from './login/login';
// import { Home } from './';
// import { NotFound } from './';

export const routes: Routes = [
  { path: 'perfil', component: Perfil },
  { path: 'habitos', component: Habitos },
  {path: 'login',component:Login }
  // { path: '', component: Home  },
  // { path: '**', component: NotFound },
];
