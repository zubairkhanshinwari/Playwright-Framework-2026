import { expect, type Page } from '@playwright/test';
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

  /**
   * @defination Company user login; lands on jobs (not admin dashboard)
   * @createdon 2026-06-02
   * @Author Sial
   */
  async login2() {
    const { url, username2, password2, selectors } = this.data;
    await this.page.context().clearCookies();
    await this.page.goto(url);
    const email = this.page.locator(selectors.email);
    const password = this.page.locator(selectors.password);
    await email.clear();
    await password.clear();
    await email.fill(username2);
    await password.fill(password2);
    await expect(email).toHaveValue(username2);
    await this.page.locator(selectors.loginButton).click();
    await this.page.waitForURL(/\/jobs\/?(\?.*)?$/i, { timeout: 60000 });
    const addJob = this.page.locator('a.nav-link.btn-green').filter({ hasText: /add job/i });
    await expect(addJob).toBeVisible({ timeout: 60000 });
    await expect(this.page).toHaveURL(/\/jobs/i);
  }
}
