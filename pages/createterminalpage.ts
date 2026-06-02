import type { Page } from '@playwright/test';
import createTerminalData from '../fixtures/createterminal.json';

export class CreateTerminalPage {
  constructor(
    private readonly page: Page,
    private readonly data: typeof createTerminalData
  ) {}

  async addTerminal() {
    const { menu, addTerminalButton, terminalUrl, popupSelector } = this.data;
    await this.page.getByRole('link', { name: menu.locations }).click();
    await this.page.getByRole('link', { name: menu.terminal, exact: true }).click();
    await this.page.waitForURL(terminalUrl, { timeout: 60000 });
    await this.page.getByRole('navigation').getByRole('link', { name: addTerminalButton }).click();
    await this.page.locator(popupSelector).waitFor({ state: 'visible', timeout: 60000 });
  }

  async createdestinat(){

  }
    async  createCrew(){

    }
}
