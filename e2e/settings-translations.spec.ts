import { expect, test } from "@playwright/test";

test.describe("Settings Page Translations E2E", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the settings page
		await page.goto("/settings");
	});

	test("should display English translations by default", async ({ page }) => {
		// Check that key elements are displayed in English using more specific selectors
		await expect(
			page.getByRole("heading", { name: "Appearance" }),
		).toBeVisible();
		await expect(page.getByText("Dark Mode")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Language & Region" }),
		).toBeVisible();
		await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
		await expect(page.getByText("Flashcard Learning App")).toBeVisible();
		await expect(page.getByText("Version 1.0.0").first()).toBeVisible();
	});

	test("should switch to Traditional Chinese (Hong Kong) translations", async ({
		page,
	}) => {
		// Click on the Traditional Chinese (Hong Kong) language option
		await page.getByText("繁體中文 (香港)").click();

		// Wait for the page to update with Chinese translations
		await page.waitForTimeout(500);

		// Check that key elements are now displayed in Traditional Chinese using more specific selectors
		await expect(page.getByRole("heading", { name: "外觀" })).toBeVisible();
		await expect(page.getByText("深色模式")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "語言與地區" }),
		).toBeVisible();
		await expect(page.getByRole("heading", { name: "關於" })).toBeVisible();
		await expect(page.getByText("閃卡學習應用程式")).toBeVisible();
		await expect(page.getByText("版本 1.0.0").first()).toBeVisible();
	});

	test("should persist language selection across page reloads", async ({
		page,
	}) => {
		// Switch to Traditional Chinese
		await page.getByText("繁體中文 (香港)").click();
		await page.waitForTimeout(500);

		// Verify Chinese is displayed using specific selectors
		await expect(page.getByRole("heading", { name: "外觀" })).toBeVisible();

		// Reload the page
		await page.reload();

		// Verify Chinese is still displayed after reload
		await expect(page.getByRole("heading", { name: "外觀" })).toBeVisible();
		await expect(page.getByRole("heading", { name: "關於" })).toBeVisible();
	});

	test("should show correct theme appearance text based on current theme", async ({
		page,
	}) => {
		// Wait for the page to load completely
		await page.waitForLoadState("networkidle");

		// Wait for the Dark Mode toggle to be visible first
		await expect(page.getByText("Dark Mode")).toBeVisible();

		// Test light mode appearance text using more specific selectors
		const lightModeText = page.getByText("Light appearance");
		const darkModeText = page.getByText("Dark appearance");

		// Check if either light or dark appearance text is visible (depends on current theme)
		const isLightVisible = await lightModeText.isVisible();
		const isDarkVisible = await darkModeText.isVisible();

		expect(isLightVisible || isDarkVisible).toBe(true);

		// Toggle theme and check that the text changes
		await page.getByRole("switch").click();
		await page.waitForTimeout(500);

		// After toggle, the opposite text should be visible
		if (isLightVisible) {
			await expect(page.getByText("Dark appearance")).toBeVisible();
		} else {
			await expect(page.getByText("Light appearance")).toBeVisible();
		}
	});

	test("should show correct theme appearance text in Chinese", async ({
		page,
	}) => {
		// Switch to Traditional Chinese
		await page.getByText("繁體中文 (香港)").click();
		await page.waitForTimeout(500);

		// Check theme appearance text in Chinese using more specific selectors
		const lightAppearanceChinese = page.getByText("淺色外觀");
		const darkAppearanceChinese = page.getByText("深色外觀");

		const isLightVisible = await lightAppearanceChinese.isVisible();
		const isDarkVisible = await darkAppearanceChinese.isVisible();

		expect(isLightVisible || isDarkVisible).toBe(true);

		// Toggle theme and check Chinese text changes
		await page.getByRole("switch").click();
		await page.waitForTimeout(300);

		if (isLightVisible) {
			await expect(page.getByText("深色外觀")).toBeVisible();
		} else {
			await expect(page.getByText("淺色外觀")).toBeVisible();
		}
	});

	test("should have language selection indicators working correctly", async ({
		page,
	}) => {
		// Check that English has selection indicator initially by looking for the selection dot
		await expect(
			page.locator(".w-2.h-2.rounded-full.bg-primary").first(),
		).toBeVisible();

		// Switch to Traditional Chinese
		await page.getByText("繁體中文 (香港)").click();
		await page.waitForTimeout(500);

		// Check that a selection indicator is still visible (now for Chinese)
		await expect(
			page.locator(".w-2.h-2.rounded-full.bg-primary"),
		).toBeVisible();

		// Verify we're now in Chinese by checking for Chinese text
		await expect(page.getByRole("heading", { name: "外觀" })).toBeVisible();
	});

	test("should maintain iOS-style design with translations", async ({
		page,
	}) => {
		// Check that iOS-style components are present using more specific selectors
		await expect(page.locator(".rounded-2xl").first()).toBeVisible(); // Rounded corners
		await expect(page.locator('[class*="bg-card"]').first()).toBeVisible(); // Card backgrounds

		// Switch to Chinese and verify design is maintained
		await page.getByText("繁體中文 (香港)").click();
		await page.waitForTimeout(500);

		// iOS-style elements should still be present
		await expect(page.locator(".rounded-2xl").first()).toBeVisible();
		await expect(page.locator('[class*="bg-card"]').first()).toBeVisible();

		// Verify Chinese text is displayed properly
		await expect(page.getByRole("heading", { name: "外觀" })).toBeVisible();
	});

	test("should translate breadcrumb text correctly", async ({ page }) => {
		// Check English breadcrumb initially - Settings is the current page so it's not a link
		await expect(
			page.getByLabel("breadcrumb").getByText("Settings"),
		).toBeVisible();

		// Switch to Traditional Chinese
		await page.getByText("繁體中文 (香港)").click();
		await page.waitForTimeout(500);

		// Check that breadcrumb is now translated to Chinese
		await expect(page.getByLabel("breadcrumb").getByText("設定")).toBeVisible();

		// Verify we can navigate using the translated breadcrumb (Home is a link)
		await page
			.getByLabel("breadcrumb")
			.getByRole("link", { name: "首頁" })
			.click();
		await expect(page.getByText("歡迎使用 LearnSwipe")).toBeVisible();
	});
});
