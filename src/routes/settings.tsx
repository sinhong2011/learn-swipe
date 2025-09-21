import { useLingui as useI18n } from '@lingui/react'
import { useLingui } from '@lingui/react/macro'
import { createFileRoute } from '@tanstack/react-router'
import { Globe, Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/animate-ui/components/radix/switch'
import { useTheme } from '@/components/theme-provider'
import {
  SettingsContainer,
  SettingsContent,
  SettingsGroup,
  SettingsRow,
  SettingsSection,
  SettingsToggleRow,
} from '@/components/ui/ios-settings'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { locales } from '@/i18n'
import { useAppStore } from '@/store/useAppStore'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { t } = useLingui()
  const { i18n } = useI18n()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useAppStore()

  useDocumentTitle(`${t`Settings`} - LearnSwipe`)

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  const handleLanguageChange = (locale: string) => {
    setLanguage(locale)
    i18n.activate(locale)
    document.documentElement.lang = locale
  }

  const isDarkMode = theme === 'dark'

  return (
    <SettingsContainer>
      <SettingsContent>
        {/* Appearance Section */}
        <SettingsSection title={t`Appearance`}>
          <SettingsToggleRow
            icon={
              isDarkMode ? (
                <Moon className="w-4 h-4 text-primary" />
              ) : (
                <Sun className="w-4 h-4 text-primary" />
              )
            }
            title={t`Dark Mode`}
            subtitle={isDarkMode ? t`Dark appearance` : t`Light appearance`}
            checked={isDarkMode}
            onCheckedChange={handleThemeToggle}
            switchComponent={Switch}
          />
        </SettingsSection>

        {/* Language Section */}
        <SettingsSection title={t`Language & Region`}>
          <SettingsGroup>
            {Object.entries(locales).map(([locale, label]) => (
              <SettingsRow
                key={locale}
                icon={<Globe className="w-4 h-4 text-primary" />}
                title={label}
                subtitle={
                  locale === 'en'
                    ? 'English'
                    : locale === 'zh-TW'
                      ? '繁體中文'
                      : locale === 'zh-CN'
                        ? '简体中文'
                        : locale === 'ja'
                          ? '日本語'
                          : locale === 'ko'
                            ? '한국어'
                            : locale
                }
                rightElement={
                  language === locale && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )
                }
                onClick={() => handleLanguageChange(locale)}
                showChevron
              />
            ))}
          </SettingsGroup>
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title={t`About`}>
          <div className="p-4 text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <img
                src="/icons/apple-touch-icon.png"
                alt="LearnSwipe"
                className="w-10 h-10 rounded-xl"
              />
            </div>
            <div className="font-semibold text-lg text-foreground">
              LearnSwipe
            </div>
            <div className="text-sm text-muted-foreground">{t`Flashcard Learning App`}</div>
            <div className="text-xs text-muted-foreground pt-2">
              {t`Version 1.0.0`}
            </div>
          </div>
        </SettingsSection>
      </SettingsContent>
    </SettingsContainer>
  )
}
