import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PasswordResetService } from '../../services/password-reset';
import { RequestPasswordReset } from './request-password-reset';

describe('RequestPasswordReset', () => {
  let component: RequestPasswordReset;
  let fixture: ComponentFixture<RequestPasswordReset>;
  let passwordResetService: jasmine.SpyObj<PasswordResetService>;

  beforeEach(async () => {
    passwordResetService = jasmine.createSpyObj('PasswordResetService', [
      'requestReset',
    ]);
    passwordResetService.requestReset.and.returnValue(
      of({ message: 'Revisá tu correo.' }),
    );

    await TestBed.configureTestingModule({
      imports: [RequestPasswordReset],
      providers: [
        provideRouter([]),
        { provide: PasswordResetService, useValue: passwordResetService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestPasswordReset);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('submits a valid email and displays the generic response', () => {
    component.form.setValue({ email: 'usuario@example.com' });

    component.onSubmit();

    expect(passwordResetService.requestReset).toHaveBeenCalledOnceWith(
      'usuario@example.com',
    );
    expect(component.successMessage).toBe('Revisá tu correo.');
  });
});
