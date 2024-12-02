import { defineConfig, devices } from '@playwright/test';
import { OrtoniReportConfig } from "ortoni-report";
//import path from 'path';

const reportConfig: OrtoniReportConfig = {
  folderPath: "ortoni-report",
  filename: "ortoni-report.html",
  //logo: path.resolve(process.cwd(), ""),
  authorName: "Tshifhiwa Sinugo",
  base64Image: false,
  preferredTheme: "dark",
  projectName: "Application Test Report",
  testType: "Regression",
};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 30 * 1000,
  expect: {
    timeout: 30 * 1000,
  },
  testDir: './tests',
  globalSetup: "./tests/utils/globalSetup.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { open: "never" }],
    ["junit", { outputFile: "results.xml" }],
    ["ortoni-report", reportConfig],
    ["dot"],
  ],
   //grep: [new RegExp("@sanity")],
  // grep: [new RegExp("@sanity"), new RegExp("@regression")],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
  },

  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: "setup",
    //   use: { ...devices["Desktop Chrome"] },
    //   testMatch: /.*\.setup\.ts/,
    // },
    // {
    //   name: "chromium",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     // set storage state for tests
    //     storageState: ".auth/login.json",
    //   },
    //   // declare that the `setup` project is a dependency
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "firefox",
    //   use: {
    //     ...devices["Desktop Firefox"],
    //     // set storage state for tests
    //     storageState: ".auth/login.json",
    //   },
    //   // declare that the `setup` project is a dependency
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "webkit",
    //   use: {
    //     ...devices["Desktop Safari"],
    //     // set storage state for tests
    //     storageState: ".auth/login.json",
    //   },
    //   // declare that the `setup` project is a dependency
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "Edge",
    //   use: {
    //     ...devices["Desktop Edge"],
    //     channel: "msedge",
    //     // set storage state for tests
    //     storageState: ".auth/login.json",
    //   },
    //   // declare that the `setup` project is a dependency
    //   dependencies: ["setup"],
    // },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
