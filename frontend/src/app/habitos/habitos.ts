import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habitos.html',
  styleUrl: './habitos.css',
})
export class Habitos implements OnInit {
  activeTab: string = 'ejercicio';

  constructor() {}

  ngOnInit(): void {}

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }
}
