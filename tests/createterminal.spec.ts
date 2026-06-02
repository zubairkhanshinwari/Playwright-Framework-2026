import { test, expect, type Page } from '@playwright/test';
import loginData from '../fixtures/login.json';
import createTerminalData from '../fixtures/createterminal.json';
import { LoginPage } from '../pages/login.page';

test('create terminal successfully', async ({ page }) => {
  test.setTimeout(120000);
  const loginPage = new LoginPage(page, loginData);
  await loginPage.login();
  await page.getByRole('link', { name: createTerminalData.menu.locations }).click();
  await page.getByRole('link', { name: createTerminalData.menu.terminal, exact: true }).click();
  await page.waitForURL(createTerminalData.terminalUrl, { timeout: 60000 });
  await page.getByRole('navigation').getByRole('link', { name: createTerminalData.addTerminalButton }).click();

  const modal = page.locator('#add_terminals');
  await expect(modal).toBeVisible();

  const randomTerminalName = `Terminal-${Date.now()}`;
  const randomEmail = `terminal.${Date.now()}@example.com`;
  const { selectors, addressValue, passwordValue } = createTerminalData;

  const terminalNameInput = modal.locator(selectors.terminalName).first();
  await terminalNameInput.click();
  await terminalNameInput.fill(randomTerminalName);
  await expect(terminalNameInput).toHaveValue(randomTerminalName);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/terminal-name.png' });


  const addressInput = modal.locator(selectors.address);
  await addressInput.fill(addressValue);
  await expect(addressInput).toHaveValue(addressValue);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/address.png' });
  const addressDropdown = page.locator(selectors.addressDropdown).first();
  if (await addressDropdown.isVisible()) {
    await addressDropdown.click();
  } else {
    await addressInput.press('ArrowDown');
    await addressInput.press('Enter');
  }

  const emailInput = modal.locator(selectors.email).first();
  await emailInput.fill(randomEmail);
  await expect(emailInput).toHaveValue(randomEmail);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/email.png' });
  
  const passwordInput = modal.locator(selectors.password).first();
  await passwordInput.fill(passwordValue);
  await expect(passwordInput).toHaveValue(passwordValue);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/password.png' });

  await modal.locator(selectors.addTerminalSubmit).click();
  await page.screenshot({ path: 'screenshots/addTerminalSubmit.png' });

  await expect(modal).toBeHidden({ timeout: 60000 });
  await searchTerminal(page, randomTerminalName);

});



async function searchTerminal(page: Page, terminalName: string) {
  await expect(page.locator('#terminalstable tbody').getByText(terminalName)).toBeVisible({ timeout: 60000 });

  await page.evaluate((name) => {
    // @ts-expect-error jQuery DataTable is loaded on page
    window.jQuery('#terminalstable').DataTable().search(name).draw();
  }, terminalName);

  const tableRows = page.locator('#terminalstable tbody tr');
  await expect(tableRows).toHaveCount(1, { timeout: 60000 });
  await expect(tableRows.first()).toContainText(terminalName);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/search-result.png' });
}
