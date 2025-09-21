import { expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe("CSV Upload Feature", () => {
	test("should upload CSV and create deck successfully", async ({ page }) => {
		await page.goto("/upload");

		// Check page title and form elements
		await expect(page.locator("h1")).toContainText("Upload CSV");
		await expect(
			page.locator('input[placeholder*="English Vocabulary"]'),
		).toBeVisible();
		await expect(page.locator('input[type="file"]')).toBeVisible();

		// Fill deck name
		await page.fill(
			'input[placeholder*="English Vocabulary"]',
			"Test Geography Deck",
		);

		// Upload CSV file
		const csvPath = path.join(__dirname, "fixtures", "sample.csv");
		await page.setInputFiles('input[type="file"]', csvPath);

		// Click import button
		await page.click('button:has-text("Import")');

		// Wait for processing status messages (may be fast, so just check for completion)
		await expect(
			page.locator('text=Imported 5 cards to deck "Test Geography Deck"'),
		).toBeVisible({ timeout: 10000 });

		// Success message should already be visible from above check

		// Should navigate to study page
		await page.waitForURL(/\/study\/.*/);
		await expect(page.locator("h1")).toContainText("Study");
	});

	test("should show error for empty deck name", async ({ page }) => {
		await page.goto("/upload");

		// Try to import without deck name
		await page.click('button:has-text("Import")');

		// Should show error
		await expect(page.locator("text=Please enter a deck name")).toBeVisible();
	});

	test("should show error for missing file", async ({ page }) => {
		await page.goto("/upload");

		// Fill deck name but no file
		await page.fill('input[placeholder*="English Vocabulary"]', "Test Deck");
		await page.click('button:has-text("Import")');

		// Should show error
		await expect(page.locator("text=Please choose a CSV file")).toBeVisible();
	});
});
