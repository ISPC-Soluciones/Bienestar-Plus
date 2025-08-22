import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuienesSomosComponent } from "./quienes-somos/quienes-somos.component";

@Component({
  selector: 'app-root',
  imports: [QuienesSomosComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('mi-proyecto');
}
