# E2E Testing with Playwright

This directory contains end-to-end tests for the LearnSwipe application using Playwright.

## Test Structure

- `upload.spec.ts` - Tests CSV upload functionality
- `study.spec.ts` - Tests the Tinder-like study interface
- `navigation.spec.ts` - Tests navigation and basic app flow
- `accessibility.spec.ts` - Tests accessibility features
- `fixtures/sample.csv` - Sample CSV file for testing

## Running Tests

```bash
# Run all tests
bun run test:e2e

# Run tests with UI mode (interactive)
bun run test:e2e:ui

# Run tests in headed mode (see browser)
bun run test:e2e:headed

# Run specific test file
bun x playwright test upload.spec.ts

# Run tests in specific browser
bun x playwright test --project=chromium
```

## Test Coverage

### Upload Feature
- ✅ Successful CSV upload and deck creation
- ✅ Error handling for missing deck name
- ✅ Error handling for missing file
- ✅ CSV parsing and validation

### Study Interface
- ✅ Card display and navigation
- ✅ Answer reveal/hide functionality
- ✅ Score tracking (know/don't know)
- ✅ Swipe gesture simulation
- ✅ Completion state handling

### Navigation
- ✅ Page routing between home/upload/study
- ✅ Header navigation links
- ✅ Theme toggle functionality
- ✅ Language switcher
- ✅ Mobile responsiveness

### Accessibility
- ✅ Proper heading hierarchy
- ✅ Form labels and ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Color contrast (basic checks)

## Configuration

The tests are configured to:
- Run against a local Vite dev server (http://localhost:5173)
- Test in Chromium, Firefox, and WebKit
- Capture screenshots/videos on failure
- Generate HTML reports

## Debugging

- Use `--debug` flag to run in debug mode
- Use `--headed` to see the browser
- Check `test-results/` for failure artifacts
- View HTML report with `bun x playwright show-report`
