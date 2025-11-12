import { test, expect } from '@playwright/test';

test.describe('Payment Form', () => {
    test('submits payment successfully', async ({ page }) => {
        // go to page
        await page.goto('/payments');

        // fill in form fields
        await page.fill('input#fromAccount', '111');
        await page.fill('input#toAccount', '222');
        await page.fill('input#amount', '100');
        await page.fill('input#memo', 'test e2e payment');

        // submit form
        await page.click('button[type="submit"]');

        // network call to backend
        const response = await page.waitForResponse(
            (res) => res.url().includes('/api/payments') && res.request().method() === 'POST'
        );

        expect(response.ok()).toBeTruthy();

        // verify UI feedback
        await expect(page.getByText(/payment created/i)).toBeVisible();
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
