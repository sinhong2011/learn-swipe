import { useLingui } from "@lingui/react/macro";
import { useEffect } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { locales } from "../i18n";

export default function LanguageSwitcher() {
	const { i18n } = useLingui();
	const { language, setLanguage } = useAppStore();

	// Initialize i18n with stored language preference on mount
	useEffect(() => {
		if (language && language !== i18n.locale) {
			i18n.activate(language);
		}
		// Update HTML lang attribute
		if (language) {
			document.documentElement.lang = language;
		}
	}, [language, i18n]);

	const handleLanguageChange = (locale: string) => {
		// Update both the store and i18n
		setLanguage(locale);
		i18n.activate(locale);
		// Update HTML lang attribute
		document.documentElement.lang = locale;
	};

	return (
		<div className="flex gap-2 items-center">
			<Select value={language} onValueChange={handleLanguageChange}>
				<SelectTrigger className="w-[120px] text-sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{Object.entries(locales).map(([locale, label]) => (
						<SelectItem key={locale} value={locale}>
							{label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
