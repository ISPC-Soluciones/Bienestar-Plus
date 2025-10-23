import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {

  /**
   * Desplaza la ventana del navegador a la parte superior de la página.
   * @param event El evento de clic.
   */
  scrollToTop(event: MouseEvent): void {
    // Previene la acción por defecto del enlace si no es un routerLink
    if (event.target instanceof HTMLAnchorElement && event.target.getAttribute('routerLink') === null) {
      event.preventDefault();
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
