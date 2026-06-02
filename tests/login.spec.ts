import { test, expect } from '@playwright/test';
import loginData from '../fixtures/login.json';
import { LoginPage } from '../pages/login.page';

test('login and navigate to dashboard', async ({ page }) => {
  test.setTimeout(120000);
  const loginPage = new LoginPage(page, loginData);
  await loginPage.login();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
});
