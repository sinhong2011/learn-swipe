import { i18n } from "@lingui/core";

export const locales = {
	en: "English",
	"zh-HK": "繁體中文 (香港)",
};

export const defaultLocale = "en";

// Cache for loaded translations to avoid re-loading
const loadedTranslations = new Set<string>();

/**
 * Dynamically load translation messages for a given locale
 */
export async function loadTranslation(locale: string): Promise<void> {
	// Skip if already loaded
	if (loadedTranslations.has(locale)) {
		return;
	}

	try {
		let messages: Record<string, any>;

		// Dynamic import based on locale
		switch (locale) {
			case "en": {
				const enModule = await import("./locales/en/messages.mjs");
				messages = enModule.messages;
				break;
			}
			case "zh-HK": {
				const zhHKModule = await import("./locales/zh-HK/messages.mjs");
				messages = zhHKModule.messages;
				break;
			}
			default: {
				console.warn(
					`Unsupported locale: ${locale}, falling back to ${defaultLocale}`,
				);
				const defaultModule = await import("./locales/en/messages.mjs");
				messages = defaultModule.messages;
				locale = defaultLocale;
				break;
			}
		}

		// Load the messages into i18n
		i18n.load({ [locale]: messages });
		loadedTranslations.add(locale);
	} catch (error) {
		console.error(`Failed to load translation for locale ${locale}:`, error);
		// Fallback to default locale if not already trying to load it
		if (locale !== defaultLocale) {
			await loadTranslation(defaultLocale);
		}
	}
}

/**
 * Activate a locale, loading its translations if necessary
 */
export async function activateLocale(locale: string): Promise<void> {
	await loadTranslation(locale);
	i18n.activate(locale);

	// Set HTML lang attribute (only in browser environment)
	if (typeof document !== "undefined") {
		document.documentElement.lang = locale;
	}
}

// Initialize with default locale
loadTranslation(defaultLocale).then(() => {
	i18n.activate(defaultLocale);

	// Set initial HTML lang attribute (only in browser environment)
	if (typeof document !== "undefined") {
		document.documentElement.lang = defaultLocale;
	}
});

export { i18n };
