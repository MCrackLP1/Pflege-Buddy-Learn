import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['iPhone 12 Pro'],
        viewport: { width: 390, height: 844 } // Primary mobile viewport
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12 Pro Safari'],
        viewport: { width: 390, height: 844 }
      },
    },
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'Desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
