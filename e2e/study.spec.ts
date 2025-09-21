import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

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

		// Should show the first card
		await expect(page.locator(".card-inner").first()).toBeVisible();
		await expect(
			page.locator("text=What is the capital of France?"),
		).toBeVisible();

		// Zen mode: no grading buttons; Blur toggle should be present
		await expect(page.locator("text=Blur Answer")).toBeVisible();
	});

	test("should show answer text and allow toggling blur", async ({ page }) => {
		// Answer should be visible by default in Zen mode
		await expect(page.locator("text=Paris")).toBeVisible();

		// Toggle blur on, then off
		await page.click("text=Blur Answer");
		const switchEl = page.getByRole("switch").first();
		await expect(switchEl).toHaveAttribute("aria-checked", "true");
		await page.click("text=Blur Answer");
		await expect(switchEl).toHaveAttribute("aria-checked", "false");
	});

	test("should advance to next card when swiping right", async ({ page }) => {
		const card = page.locator(".card-inner").first();
		const box = await card.boundingBox();
		if (!box) throw new Error("Card not found");

		const centerX = box.x + box.width / 2;
		const centerY = box.y + box.height / 2;

		await page.mouse.move(centerX, centerY);
		await page.mouse.down();
		await page.mouse.move(centerX + 200, centerY, { steps: 10 });
		await page.mouse.up();

		// Wait for animation and next card
		await page.waitForTimeout(400);
		await expect(
			page.locator("text=How do you say hello in Spanish?"),
		).toBeVisible();
	});

	test("should also advance when swiping left", async ({ page }) => {
		const card = page.locator(".card-inner").first();
		const box = await card.boundingBox();
		if (!box) throw new Error("Card not found");

		const centerX = box.x + box.width / 2;
		const centerY = box.y + box.height / 2;

		await page.mouse.move(centerX, centerY);
		await page.mouse.down();
		await page.mouse.move(centerX - 200, centerY, { steps: 10 });
		await page.mouse.up();

		// Wait for animation and next card
		await page.waitForTimeout(400);
		await expect(page.locator("text=What is 2 + 2?")).toBeVisible();
	});

	test("should keep cycling cards without completion message", async ({
		page,
	}) => {
		// Swipe through more cards than exist to ensure cycling
		for (let i = 0; i < 7; i++) {
			const card = page.locator(".card-inner").last();
			await expect(card).toBeVisible();
			const box = await card.boundingBox();
			if (!box) throw new Error("Card not found");

			const centerX = box.x + box.width / 2;
			const centerY = box.y + box.height / 2;

			await page.mouse.move(centerX, centerY);
			await page.mouse.down();
			await page.mouse.move(centerX + 200, centerY, { steps: 10 });
			await page.mouse.up();
			await page.waitForTimeout(400);
		}

		await expect(page.locator("text=No due cards")).toHaveCount(0);
		await expect(page.locator(".card-inner").last()).toBeVisible();
	});

	test("should handle swipe gestures on cards", async ({ page }) => {
		const card = page.locator(".card-inner").first();

		// Get card bounding box for swipe calculation
		const box = await card.boundingBox();
		if (!box) throw new Error("Card not found");

		const centerX = box.x + box.width / 2;
		const centerY = box.y + box.height / 2;

		// Simulate swipe right gesture
		await page.mouse.move(centerX, centerY);
		await page.mouse.down();
		await page.mouse.move(centerX + 200, centerY, { steps: 10 });
		await page.mouse.up();

		// Wait for animation
		await page.waitForTimeout(500);

		// Next card should be visible
		await expect(
			page.locator("text=How do you say hello in Spanish?"),
		).toBeVisible();
	});
});
