import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './src/tests/e2e',
    timeout: 30_000,
    expect: {
        timeout: 5_000,
    },
    use: {
        baseURL: 'http://localhost:5173',
        headless: true,
        video: 'retain-on-failure',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'WebKit', use: { ...devices['Desktop Safari'] } },
    ],
    webServer: [
        {
            command: 'npm run dev',
            port: 5173,
            reuseExistingServer: true,
        },
        {
            command: 'cd ../backend && mvn spring-boot:run',
            port: 4000,
            reuseExistingServer: true,
        },
    ],
});
