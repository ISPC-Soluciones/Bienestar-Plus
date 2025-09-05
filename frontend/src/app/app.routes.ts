import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Perfil } from './pages/perfil/perfil';
import { Habitos } from './pages/habitos/habitos';
import { Registro } from './pages/registro/registro';
import { NosotrosComponent } from './pages/nosotros/nosotros';
import { Login } from './pages/login/login';

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


