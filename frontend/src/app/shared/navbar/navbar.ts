import { Component, AfterViewInit, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements AfterViewInit {
  userId$: Observable<number | null>;

  constructor(private authService: AuthService) {
    this.userId$ = this.authService.currentUserId$;
  }

  ngAfterViewInit() {
    this.closeMenuOnLinkClick();
  }

  closeMenuOnLinkClick(): void {
    // Se seleccionan todos los enlaces de navegación dentro del menú
    const navLinks = document.querySelectorAll('.nav-links a');
    // Se obtiene el elemento de la casilla de verificación oculta
    const menuToggle = document.getElementById(
      'menu-toggle'
    ) as HTMLInputElement;

    if (menuToggle && navLinks.length > 0) {
      // Se recorre cada enlace y se agrega un escuchador de eventos de clic
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          // Cuando se hace clic en un enlace, se desmarca la casilla para ocultar el menú
          menuToggle.checked = false;
        });
      });
    }
  }
}
