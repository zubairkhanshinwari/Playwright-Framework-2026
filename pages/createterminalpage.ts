import { expect, type Page } from '@playwright/test';
import createTerminalData from '../fixtures/createterminal.json';

export class CreateTerminalPage {
  private randomTerminalName = '';

  constructor(
    private readonly page: Page,
    private readonly data: typeof createTerminalData
  ) {}


  async openAddTerminalPopup() {
    const { menu, addTerminalButton, terminalUrl, popupSelector } = this.data;
    await this.page.getByRole('link', { name: menu.locations }).click();
    await this.page.getByRole('link', { name: menu.terminal, exact: true }).click();
    await this.page.waitForURL(terminalUrl, { timeout: 60000 });
    await this.page.getByRole('navigation').getByRole('link', { name: addTerminalButton }).click();
    await expect(this.page.locator(popupSelector)).toBeVisible();
  }

  async createTerminal() {
    const {
      selectors,
      addressValue,
      passwordValue,
      dataFormatValue,
      netWeightValue,
      grossWeightValue,
      ticketNumberValue,
      unitValue,
      popupSelector,
    } = this.data;
    const timestamp = Date.now();
    const randomTerminalName = `Terminal-${timestamp}`;
    const randomEmail = `terminal.${timestamp}@example.com`;
    this.randomTerminalName = randomTerminalName;

    const modal = this.page.locator(popupSelector);

    const terminalNameInput = modal.locator(selectors.terminalName).first();
    await terminalNameInput.click();
    await terminalNameInput.fill(randomTerminalName);
    await expect(terminalNameInput).toHaveValue(randomTerminalName);
    await this.page.waitForTimeout(3000);
    await this.page.screenshot({ path: 'screenshots/terminal-name.png' });

    const addressInput = modal.locator(selectors.address);
    await addressInput.fill(addressValue);
    await expect(addressInput).toHaveValue(addressValue);
    await this.page.waitForTimeout(3000);
    await this.page.screenshot({ path: 'screenshots/address.png' });

    const addressDropdown = this.page.locator(selectors.addressDropdown).first();
    if (await addressDropdown.isVisible()) {
      await addressDropdown.click();
    } else {
      await addressInput.press('ArrowDown');
      await addressInput.press('Enter');
    }

    const emailInput = modal.locator(selectors.email).first();
    await emailInput.fill(randomEmail);
    await expect(emailInput).toHaveValue(randomEmail);
    await this.page.waitForTimeout(1500);
    await this.page.screenshot({ path: 'screenshots/email.png' });

    const passwordInput = modal.locator(selectors.password).first();
    await passwordInput.fill(passwordValue);
    await expect(passwordInput).toHaveValue(passwordValue);
    await this.page.waitForTimeout(1500);
    await this.page.screenshot({ path: 'screenshots/password.png' });

    ////click on checkbox /////
    await modal.locator(selectors.qrCodesCheckbox).click();
    await this.page.waitForTimeout(3000);

    await modal.locator(selectors.dataFormat).selectOption(dataFormatValue);
    await this.page.waitForTimeout(1500);

    const netWeight = modal.locator(selectors.netWeight);
    await netWeight.fill(netWeightValue);
    await this.page.waitForTimeout(1500);

    const grossWeight = modal.locator(selectors.grossWeight);
    await grossWeight.fill(grossWeightValue);
    await this.page.waitForTimeout(1000);

    const ticketNumber = modal.locator(selectors.ticketNumber);
    await ticketNumber.fill(ticketNumberValue);
    await this.page.waitForTimeout(2000);

    const unit = modal.locator(selectors.unit);
    await unit.scrollIntoViewIfNeeded();
    await unit.selectOption(unitValue);
    await this.page.waitForTimeout(3000);

    await modal.locator(selectors.addTerminalSubmit).click();
    await this.page.screenshot({ path: 'screenshots/addTerminalSubmit.png' });
    await expect(modal).toBeHidden({ timeout: 60000 });
  } 
  async searchTerminal() {
    const terminalName = this.randomTerminalName;
    await expect(this.page.locator('#terminalstable tbody').getByText(terminalName)).toBeVisible({
      timeout: 60000,
    });

    await this.page.evaluate((name) => {
      // @ts-expect-error jQuery DataTable is loaded on page
      window.jQuery('#terminalstable').DataTable().search(name).draw();
    }, terminalName);

    const tableRows = this.page.locator('#terminalstable tbody tr');
    await expect(tableRows).toHaveCount(1, { timeout: 60000 });
    await expect(tableRows.first()).toContainText(terminalName);
    await this.page.waitForTimeout(3000);
    await this.page.screenshot({ path: 'screenshots/search-result.png' });
  }


  

}
