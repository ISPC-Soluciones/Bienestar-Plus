import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PasswordResetService } from '../../services/password-reset';

@Component({
  selector: 'app-request-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './request-password-reset.html',
  styleUrl: './password-reset.css',
})
export class RequestPasswordReset {
  private readonly formBuilder = inject(FormBuilder);
  private readonly passwordResetService = inject(PasswordResetService);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.passwordResetService
      .requestReset(this.form.controls.email.value)
      .subscribe({
        next: ({ message }) => {
          this.successMessage = message;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage =
            'No pudimos procesar la solicitud. Intentá nuevamente más tarde.';
          this.isLoading = false;
        },
      });
  }
}
