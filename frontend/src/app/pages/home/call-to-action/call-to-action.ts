import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-call-to-action',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './call-to-action.html',
  styleUrls: [], // Ya no requiere el archivo CSS externo
})
export class CallToAction {}
