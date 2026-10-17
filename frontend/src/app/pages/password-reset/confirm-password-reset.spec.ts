import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PasswordResetService } from '../../services/password-reset';
import { ConfirmPasswordReset } from './confirm-password-reset';

describe('ConfirmPasswordReset', () => {
  let component: ConfirmPasswordReset;
  let fixture: ComponentFixture<ConfirmPasswordReset>;
  let passwordResetService: jasmine.SpyObj<PasswordResetService>;

  beforeEach(async () => {
    passwordResetService = jasmine.createSpyObj('PasswordResetService', [
      'confirmReset',
    ]);
    passwordResetService.confirmReset.and.returnValue(
      of({ message: 'Contraseña actualizada.' }),
    );

    await TestBed.configureTestingModule({
      imports: [ConfirmPasswordReset],
      providers: [
        provideRouter([]),
        { provide: PasswordResetService, useValue: passwordResetService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ token: 'token' }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmPasswordReset);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates matching passwords with the token from the URL', () => {
    component.form.setValue({
      password: 'Password123',
      confirmarPassword: 'Password123',
    });

    component.onSubmit();

    expect(passwordResetService.confirmReset).toHaveBeenCalledOnceWith(
      'token',
      'Password123',
      'Password123',
    );
    expect(component.wasReset).toBeTrue();
  });
});
