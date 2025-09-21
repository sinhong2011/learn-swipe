import { expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe("Study Interface", () => {
	test.beforeEach(async ({ page }) => {
		// Upload a deck first
		await page.goto("/upload");
		await page.fill(
			'input[placeholder*="English Vocabulary"]',
			"E2E Test Deck",
		);

		const csvPath = path.join(__dirname, "fixtures", "sample.csv");
		await page.setInputFiles('input[type="file"]', csvPath);
		await page.click('button:has-text("Import")');

		// Wait for redirect to study page
		await page.waitForURL(/\/study\/.*/);
	});

	test("should display study interface correctly", async ({ page }) => {
		// Check study page elements
		await expect(page.locator("h1")).toContainText("5");
		await expect(page.locator("text=Score:")).toBeVisible();

		// Should show the first card
		await expect(page.locator(".card-inner")).toBeVisible();
		await expect(
			page.locator("text=What is the capital of France?"),
		).toBeVisible();

		// Should show action buttons
		await expect(page.locator('button:has-text("Know")')).toBeVisible();
		await expect(page.locator('button:has-text("Don\'t")')).toBeVisible();
		await expect(page.locator('button:has-text("Reveal")')).toBeVisible();
	});

	test("should reveal answer when clicking reveal button", async ({ page }) => {
		// Click reveal button
		await page.click('button:has-text("Reveal")');

		// Should show the answer
		await expect(page.locator("text=Paris")).toBeVisible();

		// Should show hide button
		await expect(page.locator('button:has-text("Hide")')).toBeVisible();
	});

	test("should update score when clicking know button", async ({ page }) => {
		// Get initial score
		const initialScore = await page.locator("text=Score:").textContent();
		expect(initialScore).toContain("0");

		// Click "I know" button
		await page.click('button:has-text("Know")');

		// Wait for card animation and score update
		await page.waitForTimeout(500);

		// Score should increase by 10
		await expect(page.locator("text=Score:")).toContainText("10");

		// Should show next card
		await expect(
			page.locator("text=How do you say hello in Spanish?"),
		).toBeVisible();
	});

	test("should update score when clicking don't know button", async ({
		page,
	}) => {
		// Click "I don't know" button
		await page.click('button:has-text("Don\'t")');

		// Wait for card animation and score update
		await page.waitForTimeout(500);

		// Score should decrease by 5
		await expect(page.locator("text=Score:")).toContainText("-5");

		// Should show next card
		await expect(
			page.locator("text=How do you say hello in Spanish?"),
		).toBeVisible();
	});

	test("should show completion message when all cards are done", async ({
		page,
	}) => {
		// Go through all 5 cards
		for (let i = 0; i < 5; i++) {
			await page.click('button:has-text("Know")');
			await page.waitForTimeout(400); // Wait for animation
		}

		// Should show completion message
		await expect(page.locator("text=No due cards. Great job!")).toBeVisible();
		await expect(
			page.locator("text=Come back later or upload more"),
		).toBeVisible();
	});

	test("should handle swipe gestures on cards", async ({ page }) => {
		const card = page.locator(".card-inner").first();

		// Get card bounding box for swipe calculation
		const box = await card.boundingBox();
		if (!box) throw new Error("Card not found");

		const centerX = box.x + box.width / 2;
		const centerY = box.y + box.height / 2;

		// Simulate swipe right gesture (know)
		await page.mouse.move(centerX, centerY);
		await page.mouse.down();
		await page.mouse.move(centerX + 200, centerY, { steps: 10 });
		await page.mouse.up();

		// Wait for animation and score update
		await page.waitForTimeout(500);

		// Score should increase
		await expect(page.locator("text=Score:")).toContainText("10");
	});
});
