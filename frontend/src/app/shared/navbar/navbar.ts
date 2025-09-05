import { Component, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements AfterViewInit {
  // Usamos AfterViewInit porque se garantiza que los elementos del DOM (los enlaces)
  // están disponibles después de que la vista ha sido inicializada.
  ngAfterViewInit() {
    this.closeMenuOnLinkClick();
  }

  closeMenuOnLinkClick(): void {
    // Se seleccionan todos los enlaces de navegación dentro del menú
    const navLinks = document.querySelectorAll('.nav-links a');
    // Se obtiene el elemento de la casilla de verificación oculta
    const menuToggle = document.getElementById('menu-toggle') as HTMLInputElement;

    if (menuToggle && navLinks.length > 0) {
      // Se recorre cada enlace y se agrega un escuchador de eventos de clic
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          // Cuando se hace clic en un enlace, se desmarca la casilla para ocultar el menú
          menuToggle.checked = false;
        });
      });
    }
  }
}