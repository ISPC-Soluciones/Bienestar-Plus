import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallToAction } from './call-to-action';

describe('CallToAction', () => {
  let component: CallToAction;
  let fixture: ComponentFixture<CallToAction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallToAction],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallToAction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
