import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env.CI,
      cwd: '.',
      timeout: 120000
    },
    {
      command: 'npm run dev',
      url: process.env.FRONTEND_URL || 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      cwd: '../emotional-aquarium-client',
      timeout: 120000
    }
  ]
})
