import { defineConfig } from '@playwright/test';
const port = Number(process.env.SITE_DEV_PORT || 3001);
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: `npx vinext dev --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
