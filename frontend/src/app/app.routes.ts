// app.routes.ts
import { Routes } from '@angular/router';
import { Perfil } from './pages/perfil/perfil';
import { Habitos } from './pages/habitos/habitos';
import { Registro } from './pages/registro/registro';
import { NosotrosComponent } from './pages/nosotros/nosotros';
import { Home } from './pages/home/home'; 

export const routes: Routes = [
  
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  { path: 'home', component: Home },
  { path: 'perfil', component: Perfil },
  { path: 'habitos', component: Habitos },
  { path: 'registro', component: Registro },
  { path: 'nosotros', component: NosotrosComponent },

  
];
