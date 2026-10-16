import type { Locator, Page } from '@playwright/test';
import { ProfilePage } from './profile.page';

export class LoginPage {
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly submitButton: Locator;
  private readonly error: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByTestId('login-email');
    this.password = page.getByTestId('login-password');
    this.submitButton = page.getByTestId('login-submit');
    this.error = page.getByRole('alert');
  }

  async open(): Promise<void> {
    await this.page.goto('/login');
  }

  async submitCredentials(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    if (await this.submitButton.isEnabled()) {
      await this.submitButton.click();
    }
  }

  async signIn(email: string, password: string): Promise<ProfilePage> {
    await this.submitCredentials(email, password);
    await this.page.waitForURL(/\/perfil\/\d+/);
    return new ProfilePage(this.page);
  }

  async submitIsDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled();
  }

  async errorIsVisible(): Promise<boolean> {
    return this.error.isVisible();
  }

  async waitForError(): Promise<void> {
    await this.error.waitFor({ state: 'visible' });
  }
}
