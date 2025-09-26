import { expect, test } from '@playwright/test'

test.describe('CSV Upload Feature', () => {
  test('should upload CSV and create deck successfully', async ({ page }) => {
    await page.goto('/upload')

    // Check page title and form elements
    await expect(page.locator('h1')).toContainText('Upload CSV')
    await expect(
      page.locator('input[placeholder*="English Vocabulary"]')
    ).toBeVisible()
    await expect(page.locator('input[type="file"]')).toBeVisible()

    // Fill deck name
    await page.fill(
      'input[placeholder*="English Vocabulary"]',
      'Test Geography Deck'
    )

    // Create and upload CSV file using the same method as accessibility tests
    const csvContent =
      'Front,Back,Tags\nWhat is the capital of France?,Paris,Geography\nHow do you say hello in Spanish?,Hola,Language\nWhat is 2 + 2?,4,Math\nWho wrote Romeo and Juliet?,Shakespeare,Literature\nWhat is the largest planet?,Jupiter,Science'

    await page.evaluate((csvContent) => {
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const file = new File([blob], 'sample.csv', { type: 'text/csv' })

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }, csvContent)

    // Wait for Import button to be enabled and click it
    await expect(page.locator('button:has-text("Import")')).toBeEnabled()
    await page.click('button:has-text("Import")')

    // Wait for processing status messages (may be fast, so just check for completion)
    await expect(
      page.locator('text=Imported 5 cards to deck "Test Geography Deck"')
    ).toBeVisible({ timeout: 10000 })

    // Success message should already be visible from above check

    // Should navigate to study page
    await page.waitForURL(/\/study\/.*/)
    await expect(page.locator('h1')).toContainText('5')
  })

  test('should keep Import disabled for empty deck name', async ({ page }) => {
    await page.goto('/upload')

    // Import should be disabled when required fields are missing
    const importBtn = page.locator('button:has-text("Import")')
    await expect(importBtn).toBeDisabled()
  })

  test('should keep Import disabled when file is missing', async ({ page }) => {
    await page.goto('/upload')

    // Fill deck name but no file
    await page.fill('input[placeholder*="English Vocabulary"]', 'Test Deck')
    const importBtn = page.locator('button:has-text("Import")')
    await expect(importBtn).toBeDisabled()
  })
})
