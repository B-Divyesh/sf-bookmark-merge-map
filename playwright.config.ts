import { defineConfig, devices } from '@playwright/test';
const liveBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: true, reporter: 'line',
  use: { baseURL: liveBaseUrl || 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: liveBaseUrl ? undefined : { command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile-390px', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } }]
});
