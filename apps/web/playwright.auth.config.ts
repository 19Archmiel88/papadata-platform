import { defineConfig } from 'playwright/test';

export default defineConfig({
  forbidOnly: true,
  fullyParallel: false,
  outputDir: 'test-results/auth-e2e',
  reporter: [['list']],
  testDir: './e2e',
  timeout: 45_000,
  use: {
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
  },
  workers: 1,
});
