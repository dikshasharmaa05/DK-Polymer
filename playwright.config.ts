import { defineConfig, devices, webkit } from '@playwright/test';
import { existsSync } from 'node:fs';

const PORT = 4321;
const iphone = { ...devices['iPhone 14'], viewport: { width: 390, height: 844 } };
const desktop = { viewport: { width: 1440, height: 900 } };

// WebKit (the iPhone Safari engine) needs its own browser download. If it is not installed,
// the WebKit projects are left out with a loud warning. Set REQUIRE_WEBKIT=1 to fail instead.
let hasWebkit = false;
try { hasWebkit = existsSync(webkit.executablePath()); } catch { hasWebkit = false; }
if (!hasWebkit) {
  const msg = 'WebKit is not installed: WebKit (iPhone Safari engine) tests will NOT run. Install with `npx playwright install webkit`.';
  if (process.env.REQUIRE_WEBKIT) throw new Error(msg);
  console.warn(`\n⚠  ${msg}\n`);
}

const chromium = [
  { name: 'chromium-desktop', use: { browserName: 'chromium' as const, ...desktop } },
  { name: 'chromium-iphone14', use: { ...iphone, browserName: 'chromium' as const } },
];
const webkitProjects = [
  { name: 'webkit-desktop', use: { browserName: 'webkit' as const, ...desktop } },
  { name: 'webkit-iphone14', use: { ...iphone, browserName: 'webkit' as const } },
];

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  projects: hasWebkit ? [...chromium, ...webkitProjects] : chromium,
  webServer: {
    command: `npx astro preview --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
