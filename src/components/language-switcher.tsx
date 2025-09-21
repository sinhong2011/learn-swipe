import { useLingui } from "@lingui/react/macro";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { activateLocale, locales } from "../i18n";

export default function LanguageSwitcher() {
	const { i18n } = useLingui();
	const { language, setLanguage } = useAppStore();
	const [isLoading, setIsLoading] = useState(false);

	// Initialize i18n with stored language preference on mount
	useEffect(() => {
		if (language && language !== i18n.locale) {
			setIsLoading(true);
			activateLocale(language).finally(() => setIsLoading(false));
		}
	}, [language, i18n]);

	const handleLanguageChange = async (locale: string) => {
		setIsLoading(true);
		try {
			// Update the store first
			setLanguage(locale);
			// Then activate the locale (this will load translations if needed)
			await activateLocale(locale);
		} catch (error) {
			console.error("Failed to change language:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex gap-2 items-center">
			<Select
				value={language}
				onValueChange={handleLanguageChange}
				disabled={isLoading}
			>
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
