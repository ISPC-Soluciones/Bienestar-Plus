import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Perfil } from './perfil/perfil';
import { Habitos } from './habitos/habitos';
import { Registro } from './registro/registro';
import { NosotrosComponent } from './nosotros/nosotros';
import { Login } from './login/login';

// import { NotFound } from './';

export const routes: Routes = [
  { path: '', component: Home  },
  { path: 'login', component: Login },
  { path: 'perfil', component: Perfil },
  { path: 'habitos', component: Habitos },
  { path: 'registro', component: Registro },
  { path: 'nosotros', component: NosotrosComponent },
  { path:"", redirectTo:"/home", pathMatch:"full" }
  // { path: '**', component: NotFound },
];


