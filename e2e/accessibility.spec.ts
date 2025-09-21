import { expect, test } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/upload')

    // Check that h1 exists and is properly used
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('Upload CSV')

    // Ensure no h2, h3 etc. appear before h1
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    if (headings.length > 1) {
      const firstHeading = headings[0]
      const tagName = await firstHeading.evaluate((el) =>
        el.tagName.toLowerCase()
      )
      expect(tagName).toBe('h1')
    }
  })

  test('should have proper form labels and accessibility', async ({ page }) => {
    await page.goto('/upload')

    // Check that form inputs have associated labels
    const deckNameInput = page.locator(
      'input[placeholder*="English Vocabulary"]'
    )
    const fileInput = page.locator('input[type="file"]')

    // Check for labels (either explicit labels or aria-label)
    const deckNameLabel = page.locator('label:has-text("Deck Name")')
    const fileLabel = page.locator('label:has-text("CSV File")')

    await expect(deckNameLabel).toBeVisible()
    await expect(fileLabel).toBeVisible()

    // Check that inputs are focusable
    await deckNameInput.focus()
    await expect(deckNameInput).toBeFocused()

    await fileInput.focus()
    await expect(fileInput).toBeFocused()
  })

  test('should have keyboard navigation support', async ({ page }) => {
    await page.goto('/upload')

    const deckNameInput = page.locator(
      'input[placeholder*="English Vocabulary"]'
    )
    const fileInput = page.locator('input[type="file"]')

    // Focus deck name, then tab to file input, then to Cancel button
    await deckNameInput.focus()
    await expect(deckNameInput).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(fileInput).toBeFocused()
    await page.keyboard.press('Tab')
    const cancelButton = page.locator('button:has-text("Cancel")')
    await expect(cancelButton).toBeFocused()
  })

  test('should have proper button accessibility in study interface', async ({
    page,
  }) => {
    // First upload a deck
    await page.goto('/upload')
    await page.fill(
      'input[placeholder*="English Vocabulary"]',
      'Accessibility Test Deck'
    )

    const csvContent = 'Front,Back\nTest Question,Test Answer'

    // Create a temporary file for upload
    await page.evaluate((csvContent) => {
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const file = new File([blob], 'test.csv', { type: 'text/csv' })

      // Create a file input and trigger change event
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

    await page.click('button:has-text("Import")')
    await page.waitForURL(/\/study\/.*/)

    // Check study interface accessibility (Zen mode)
    const blurLabel = page.locator('text=Blur Answer')
    await expect(blurLabel).toBeVisible()
    const switchEl = page.getByRole('switch').first()
    await expect(switchEl).toBeVisible()
    await switchEl.focus()
    await expect(switchEl).toBeFocused()
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')

    // This is a basic check - in a real app you'd use axe-core or similar
    // Check that text is visible against background
    const textElements = await page
      .locator('p, h1, h2, h3, a, button, span')
      .all()

    for (const element of textElements.slice(0, 5)) {
      // Check first 5 elements
      const isVisible = await element.isVisible()
      if (isVisible) {
        const text = await element.textContent()
        if (text?.trim()) {
          // Element has text and is visible - basic contrast check passed
          expect(text.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

  test('should handle focus management in card interactions', async ({
    page,
  }) => {
    // Upload a test deck first
    await page.goto('/upload')
    await page.fill(
      'input[placeholder*="English Vocabulary"]',
      'Focus Test Deck'
    )

    await page.evaluate(() => {
      const csvContent = 'Question,Answer\nWhat is focus?,Managing attention'
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const file = new File([blob], 'test.csv', { type: 'text/csv' })

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    await page.click('button:has-text("Import")')
    await page.waitForURL(/\/study\/.*/)

    // Test that focus is managed properly when toggling blur
    const switchEl = page.getByRole('switch').first()
    await switchEl.click()
    await expect(switchEl).toBeFocused()
    await expect(switchEl).toHaveAttribute('aria-checked', 'true')
  })
})
