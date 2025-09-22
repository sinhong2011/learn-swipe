import { i18n } from '@/i18n'

/**
 * Route translation mapping
 * Maps route segments to their translation keys that already exist in the system
 */
const routeTranslationKeys: Record<string, string> = {
  home: 'Home',
  settings: 'Settings',
  decks: 'Decks',
  study: 'Study',
  about: 'About',
  profile: 'Profile',
  help: 'Help',
  upload: 'Upload',
}

/**
 * Robust translation utility for route segments and dynamic content
 *
 * This function tries multiple translation strategies in order:
 * 1. Direct route translation using existing translation keys
 * 2. Route-specific key (e.g., "route.decks" -> "牌組")
 * 3. Direct translation key (e.g., "Decks" -> "牌組")
 * 4. Fallback to formatted segment name
 *
 * @param segment - The route segment or text to translate
 * @param prefix - Optional prefix for translation keys (default: "route")
 * @returns Translated text or formatted fallback
 */
export function translateSegment(segment: string, prefix = 'route'): string {
  const cleanSegment = segment.replace(/\$|:.*/g, '').replace(/-/g, '')
  const lowerSegment = cleanSegment.toLowerCase()

  // Strategy 1: Try direct route translation using existing translation keys
  if (lowerSegment in routeTranslationKeys) {
    try {
      const translationKey = routeTranslationKeys[lowerSegment]
      const translated = i18n._(translationKey)
      if (translated && translated !== translationKey) {
        return translated
      }
    } catch {
      // Continue to next strategy if direct translation fails
    }
  }

  // Try multiple translation strategies in order of preference
  const strategies = [
    // Strategy 2: Try prefixed translation key (e.g., "route.decks")
    `${prefix}.${lowerSegment}`,
    // Strategy 3: Try direct segment translation (e.g., "Decks")
    cleanSegment.charAt(0).toUpperCase() + cleanSegment.slice(1).toLowerCase(),
  ]

  for (const key of strategies) {
    try {
      // Check if translation exists for this key
      const translated = i18n._(key)
      // If translation exists and is different from the key, use it
      if (translated && translated !== key) {
        return translated
      }
    } catch {}
  }

  // Fallback: Format the segment nicely
  return cleanSegment
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim()
}

/**
 * Get translated route name for breadcrumbs
 * @param segment - Route segment
 * @returns Translated route name
 */
export function getRouteTranslation(segment: string): string {
  return translateSegment(segment, 'route')
}

/**
 * Check if a translation key exists
 * @param key - Translation key to check
 * @returns True if translation exists
 */
export function hasTranslation(key: string): boolean {
  try {
    const translated = i18n._(key)
    return !!translated && translated !== key
  } catch {
    return false
  }
}
