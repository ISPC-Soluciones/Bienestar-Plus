import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { NotificacionesWebSocketService } from './notificaciones-websocket';

describe('NotificacionesWebSocketService', () => {
  let service: NotificacionesWebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(NotificacionesWebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
