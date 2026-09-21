import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PasswordResetService } from '../../services/password-reset';

function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmarPassword')?.value;
  return password === confirmation ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-confirm-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './confirm-password-reset.html',
  styleUrl: './password-reset.css',
})
export class ConfirmPasswordReset {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly passwordResetService = inject(PasswordResetService);

  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  readonly form = this.formBuilder.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', Validators.required],
    },
    { validators: matchingPasswords },
  );

  isLoading = false;
  wasReset = false;
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.token) {
      this.errorMessage = 'El enlace de recuperación está incompleto.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { password, confirmarPassword } = this.form.getRawValue();
    this.passwordResetService
      .confirmReset(this.token, password, confirmarPassword)
      .subscribe({
        next: () => {
          this.wasReset = true;
          this.isLoading = false;
          this.form.disable();
        },
        error: () => {
          this.errorMessage =
            'El enlace no es válido o ya venció. Solicitá uno nuevo.';
          this.isLoading = false;
        },
      });
  }
}
