import { defineConfig, devices } from '@playwright/test';

const { deviceScaleFactor: _deviceScaleFactor, viewport: _viewport, ...desktopChrome } =
  devices['Desktop Chrome'];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...desktopChrome, viewport: null },
    },
  ],
});
