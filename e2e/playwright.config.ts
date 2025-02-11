import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  retries: 1,
  testMatch: 'survey.test.ts',
  projects: [
    {
      name: 'Chrome',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: { ignoreHTTPSErrors: true },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Mobile Chrome',
      use: devices['Nokia Lumia 520'], // width: 320, height: 533
    },
    {
      name: 'Mobile Safari',
      use: devices['iPhone SE'], // width: 320, height: 568
    },
  ],
};

export default config;
