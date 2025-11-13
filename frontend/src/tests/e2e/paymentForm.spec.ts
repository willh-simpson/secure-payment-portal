import { test, expect } from '@playwright/test';

test.describe('Payment Form', () => {
    test('submits payment successfully', async ({ page }) => {
        await page.goto('/payments');

        await page.fill('input#fromAccount', '111');
        await page.fill('input#toAccount', '222');
        await page.fill('input#amount', '100');
        await page.fill('input#memo', 'test non-mfa e2e payment');

        // wait for network call + click
        const [response] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/api/payments') && res.request().method() === 'POST'
            ),
            page.click('button[type="submit"]'),
        ]);

        // backend response
        expect(response.ok()).toBeTruthy();
        const json = await response.json();
        expect(json).not.toBeNull();
        expect(json.requiresMfa).toBeFalsy();

        // success message
        await expect(page.getByText(/completed successfully/i)).toBeVisible();
    });

    test('prompts for MFA when required and confirms successfully', async ({ page }) => {
        await page.goto('/payments');

        // intercept confirm request and mock 200 response
        await page.route('**/api/payments/**/confirm', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: 'CONFIRMED' }),
            });
        });

        await page.fill('input#fromAccount', '111');
        await page.fill('input#toAccount', '222');
        await page.fill('input#amount', '1500');
        await page.fill('input#memo', 'test mfa e2e payment');

        const [response] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/api/payments') && res.request().method() === 'POST'
            ),
            page.click('button[type="submit"]'),
        ]);

        const json = await response.json();
        expect(json.requiresMfa).toBeTruthy();

        // verify modal is displayed and payment is confirmed through it
        await expect(page.getByText(/confirm payment/i)).toBeVisible();

        await page.fill('input[placeholder="000000"]', '123456');

        // wait for confirm request
        const [confirmResponse] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/confirm') && res.request().method() === 'PUT'
            ),
            page.click('button:has-text("Confirm")'),
        ]);

        expect(confirmResponse.ok()).toBeTruthy();
        const confirmJson = await confirmResponse.json();
        expect(confirmJson.status).toBe('CONFIRMED');

        await expect(page.locator('text=Confirm Payment')).toHaveCount(0);
        await expect(page.getByText(/payment confirmed/i)).toBeVisible();
    });

    test('shows error message when invalid MFA code is entered', async ({ page }) => {
        await page.goto('/payments');

        await page.fill('input#fromAccount', '111');
        await page.fill('input#toAccount', '222');
        await page.fill('input#amount', '1500');
        await page.fill('input#memo', 'test invalid mfa e2e payment');

        const [response] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/api/payments') && res.request().method() === 'POST'
            ),
            page.click('button[type="submit"]'),
        ]);

        const json = await response.json();
        expect(json.requiresMfa).toBeTruthy();

        await expect(page.getByText(/confirm payment/i)).toBeVisible();

        await page.fill('input[placeholder="000000"]', '999999');

        const [confirmResponse] = await Promise.all([
            page.waitForResponse(
                (res) => res.url().includes('/confirm') && res.request().method() === 'PUT'
            ),
            page.click('button:has-text("Confirm")'),
        ]);

        expect(confirmResponse.ok()).toBeFalsy();

        await expect(page.getByText(/invalid/i)).toBeVisible();
    });

    test('shows validation errors for empty fields', async ({ page }) => {
        // submit form with no fields entered
        await page.goto('/payments');
        await page.click('button[type="submit"]');

        await expect(page.locator('#fromAccount + p')).toHaveText(/required/i);
        await expect(page.locator('#toAccount + p')).toHaveText(/required/i);
        await expect(page.locator('#amount + p')).toHaveText(/required/i);
    });
});
