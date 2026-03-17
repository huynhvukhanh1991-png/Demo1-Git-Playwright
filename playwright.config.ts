import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Playwright Test Configuration
 * See https://playwright.dev/docs/test-configuration
 */
const isCI = !!process.env.CI;

export default defineConfig({
  // ========== Timeouts ==========
  timeout: 300000,           // test timeout: 5 minutes
  expect: {
    timeout: 10000           // assertion timeout: 10 seconds
  },

  // ========== Test Discovery ==========
  testDir: './tests',
  testMatch: '**/*.spec.ts',  // only run .spec.ts files
  
  // ========== Execution Settings ==========
  fullyParallel: true,        // run tests in parallel
  forbidOnly: isCI,           // fail in CI if test.only exists
  retries: isCI ? 2 : 0,      // retry failed tests on CI only
  workers: isCI ? 1 : undefined,  // single worker on CI, auto on dev
  
  // ========== Reporting ==========
  reporter: [
    ['html'],                 // HTML report
    ['list'],                 // terminal output
    // Uncomment for Allure reporting
    // ['allure-playwright'],
  ],
  outputDir: 'test-results',  // test results directory
  snapshotDir: 'tests/__snapshots__',

  // ========== Shared Options ==========
  use: {
    // Base URL for navigations
    baseURL: 'https://demo1.cybersoft.edu.vn',

    // Network
    httpCredentials: process.env.HTTP_USER && process.env.HTTP_PASSWORD
      ? { username: process.env.HTTP_USER, password: process.env.HTTP_PASSWORD }
      : undefined,

    // Timeouts
    actionTimeout: 10000,     // timeout for each action (10s)
    navigationTimeout: 15000, // timeout for navigation (15s)

    // Media
    screenshot: 'only-on-failure',  // capture screenshots on failure
    video: 'on-first-retry',        // capture videos on retry
    trace: 'on-first-retry',        // capture traces on retry

    // Viewport (desktop)
    viewport: { width: 1280, height: 720 },

    // Locale & timezone
    locale: 'en-US',
    timezoneId: 'Asia/Ho_Chi_Minh',
  },

  // ========== Projects (Browsers) ==========
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment for mobile testing
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    // Uncomment for branded browsers
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // ========== Web Server (if needed) ==========
  // Uncomment if running a local dev server
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !isCI,
  //   timeout: 120000,
  // },

  // ========== Global Setup/Teardown ==========
  // globalSetup: require.resolve('./tests/setup/globalSetup.ts'),
  // globalTeardown: require.resolve('./tests/setup/globalTeardown.ts'),
});
