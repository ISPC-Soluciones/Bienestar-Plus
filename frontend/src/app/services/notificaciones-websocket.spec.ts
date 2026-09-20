import { TestBed } from '@angular/core/testing';

import { NotificacionesWebsocket } from './notificaciones-websocket';

describe('NotificacionesWebsocket', () => {
  let service: NotificacionesWebsocket;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacionesWebsocket);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
