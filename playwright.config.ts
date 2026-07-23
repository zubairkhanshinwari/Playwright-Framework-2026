import { defineConfig, devices } from '@playwright/test';

const { deviceScaleFactor: _deviceScaleFactor, viewport: _viewport, ...desktopChrome } =
  devices['Desktop Chrome'];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html']] : 'html',
  use: {
    trace: 'on-first-retry',
    viewport: process.env.CI ? { width: 1280, height: 720 } : null,
    launchOptions: process.env.CI
      ? undefined
      : {
          args: ['--start-maximized'],
        },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...desktopChrome,
        viewport: process.env.CI ? { width: 1280, height: 720 } : null,
      },
    },
  ],
});
