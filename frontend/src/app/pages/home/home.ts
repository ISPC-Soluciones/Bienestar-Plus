import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Carousel } from "./carousel/carousel";
import { Features } from "./features/features";
import { CallToAction } from "./call-to-action/call-to-action";
import { Testimonials } from './testimonials/testimonials';
import { NewsSection } from '../news-section/news-section';


@Component({
  selector: 'app-home',
  imports: [CommonModule, Carousel, Features, Testimonials, CallToAction, NewsSection],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
