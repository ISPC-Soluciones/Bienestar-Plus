import type { Page } from '@playwright/test';

export class ProfilePage {
  constructor(private readonly page: Page) {}

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
