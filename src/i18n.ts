import { i18n } from "@lingui/core";
import { messages as enMessages } from "./locales/en/messages.mjs";
import { messages as zhHKMessages } from "./locales/zh-HK/messages.mjs";

export const locales = {
	en: "English",
	"zh-HK": "繁體中文 (香港)",
};

export const defaultLocale = "en";

i18n.load({
	en: enMessages,
	"zh-HK": zhHKMessages,
});

i18n.activate(defaultLocale);

// Set initial HTML lang attribute (only in browser environment)
if (typeof document !== "undefined") {
	document.documentElement.lang = defaultLocale;
}

export { i18n };
