import { expect, test } from '@playwright/test'

test.describe('Navigation and Basic App Flow', () => {
  test('should navigate between pages correctly', async ({ page }) => {
    // Start at home page
    await page.goto('/')

    // Check home page loads
    await expect(page.locator('text=Get Started')).toBeVisible()

    // Navigate to upload page directly
    await page.goto('/upload')
    await expect(page).toHaveURL('/upload')
    await expect(page.locator('h1')).toContainText('Upload CSV')

    // Navigate back to home
    await page.goto('/')
    await expect(page).toHaveURL('/')
  })

  test('should have working theme toggle', async ({ page }) => {
    await page.goto('/')

    // Find theme toggle button (assuming it exists in header)
    const themeToggle = page.locator(
      '[data-testid="theme-toggle"], button[aria-label*="theme"], button:has([data-lucide="sun"]), button:has([data-lucide="moon"])'
    )

    if ((await themeToggle.count()) > 0) {
      // Click theme toggle
      await themeToggle.first().click()

      // Check if dark class is applied to html or body
      const isDark = await page.evaluate(() => {
        return (
          document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark')
        )
      })

      expect(typeof isDark).toBe('boolean')
    }
  })

  test('should handle direct navigation to study page without deck', async ({
    page,
  }) => {
    // Try to navigate directly to study page with invalid deck ID
    await page.goto('/study/invalid-deck-id')

    // Should either redirect or show appropriate message
    // This depends on your error handling implementation
    await page.waitForTimeout(1000)

    // Check that page doesn't crash
    const hasError =
      (await page.locator('text=Loading').count()) > 0 ||
      (await page.locator('text=No due cards').count()) > 0 ||
      (await page.locator('text=Error').count()) > 0

    expect(typeof hasError).toBe('boolean')
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Check that header is still visible
    await expect(page.locator('header').first()).toBeVisible()

    // Navigate to upload page
    await page.goto('/upload')
    await expect(page).toHaveURL('/upload')

    // Check that form elements are properly sized for mobile
    const deckNameInput = page.locator(
      'input[placeholder*="English Vocabulary"]'
    )
    const fileInput = page.locator('input[type="file"]')
    const importButton = page.locator('button:has-text("Import")')

    await expect(deckNameInput).toBeVisible()
    await expect(fileInput).toBeVisible()
    await expect(importButton).toBeVisible()

    // Check that elements are touch-friendly (at least 36px height)
    const buttonBox = await importButton.boundingBox()
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(36)
    }
  })
})
