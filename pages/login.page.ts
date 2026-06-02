import type { Page } from '@playwright/test';
import type loginData from '../fixtures/login.json';


export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly data: typeof loginData
  ) {}


  async login() {
    const { url, dashboardUrl, username, password, selectors } = this.data;
    await this.page.goto(url);
    await this.page.locator(selectors.email).fill(username);
    await this.page.locator(selectors.password).fill(password);
    await this.page.locator(selectors.loginButton).click();
    await this.page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 60000 });
    await this.page.goto(dashboardUrl);
    await this.page.waitForURL((u) => u.pathname.includes('/admin/dashboard'), { timeout: 60000 });
    
  }
  
}
