import { test } from '@playwright/test';
import loginData from '../fixtures/login.json';
import createTerminalData from '../fixtures/createterminal.json';
import { LoginPage } from '../pages/login.page';
import { CreateTerminalPage } from '../pages/createterminalpage';

test('create terminal successfully', async ({ page }) => {
  test.setTimeout(180000);

  const loginPage = new LoginPage(page, loginData);
  await loginPage.login();

  const createTerminalPage = new CreateTerminalPage(page, createTerminalData);

  await createTerminalPage.openAddTerminalPopup();
  await createTerminalPage.createTerminal();
  await createTerminalPage.searchTerminal();
});
