// app.routes.ts
import { Routes } from '@angular/router';
import { Perfil } from './perfil/perfil';
import { Habitos } from './habitos/habitos';
import { Registro } from './registro/registro';
import { NosotrosComponent } from './nosotros/nosotros';
import { Home } from './home/home'; 

export const routes: Routes = [
  
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  { path: 'home', component: Home },
  { path: 'perfil', component: Perfil },
  { path: 'habitos', component: Habitos },
  { path: 'registro', component: Registro },
  { path: 'nosotros', component: NosotrosComponent },

  
];
