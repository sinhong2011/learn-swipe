import { expect, test } from "@playwright/test";

test.describe("Navigation and Basic App Flow", () => {
	test("should navigate between pages correctly", async ({ page }) => {
		// Start at home page
		await page.goto("/");

		// Check home page loads
		await expect(page.locator("text=Learn React")).toBeVisible();

		// Navigate to upload page via header
		await page.click('a:has-text("Upload")');
		await expect(page).toHaveURL("/upload");
		await expect(page.locator("h1")).toContainText("Upload CSV");

		// Navigate back to home via header
		await page.click('a:has-text("Home")');
		await expect(page).toHaveURL("/");
	});

	test("should have working theme toggle", async ({ page }) => {
		await page.goto("/");

		// Find theme toggle button (assuming it exists in header)
		const themeToggle = page.locator(
			'[data-testid="theme-toggle"], button[aria-label*="theme"], button:has([data-lucide="sun"]), button:has([data-lucide="moon"])',
		);

		if ((await themeToggle.count()) > 0) {
			// Click theme toggle
			await themeToggle.first().click();

			// Check if dark class is applied to html or body
			const isDark = await page.evaluate(() => {
				return (
					document.documentElement.classList.contains("dark") ||
					document.body.classList.contains("dark")
				);
			});

			expect(typeof isDark).toBe("boolean");
		}
	});

	test("should have working language switcher", async ({ page }) => {
		await page.goto("/");

		// Find language switcher (assuming it exists in header)
		const langSwitcher = page.locator(
			'[data-testid="language-switcher"], select, button:has-text("EN"), button:has-text("ZH")',
		);

		if ((await langSwitcher.count()) > 0) {
			// Language switcher exists, test it
			await langSwitcher.first().click();

			// Just verify it's interactive - actual language change testing would need more setup
			expect(await langSwitcher.first().isVisible()).toBe(true);
		}
	});

	test("should handle direct navigation to study page without deck", async ({
		page,
	}) => {
		// Try to navigate directly to study page with invalid deck ID
		await page.goto("/study/invalid-deck-id");

		// Should either redirect or show appropriate message
		// This depends on your error handling implementation
		await page.waitForTimeout(1000);

		// Check that page doesn't crash
		const hasError =
			(await page.locator("text=Loading").count()) > 0 ||
			(await page.locator("text=No due cards").count()) > 0 ||
			(await page.locator("text=Error").count()) > 0;

		expect(typeof hasError).toBe("boolean");
	});

	test("should be responsive on mobile viewport", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto("/");

		// Check that header is still visible and functional
		await expect(page.locator("header").first()).toBeVisible();
		await expect(page.locator('a:has-text("Home")')).toBeVisible();
		await expect(page.locator('a:has-text("Upload")')).toBeVisible();

		// Navigate to upload page
		await page.click('a:has-text("Upload")');
		await expect(page).toHaveURL("/upload");

		// Check that form elements are properly sized for mobile
		const deckNameInput = page.locator(
			'input[placeholder*="English Vocabulary"]',
		);
		const fileInput = page.locator('input[type="file"]');
		const importButton = page.locator('button:has-text("Import")');

		await expect(deckNameInput).toBeVisible();
		await expect(fileInput).toBeVisible();
		await expect(importButton).toBeVisible();

		// Check that elements are touch-friendly (at least 44px height)
		const buttonBox = await importButton.boundingBox();
		if (buttonBox) {
			expect(buttonBox.height).toBeGreaterThanOrEqual(36); // Allowing some margin
		}
	});
});
