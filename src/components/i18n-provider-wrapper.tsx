import { I18nProvider } from '@lingui/react'
import { type ReactNode, useEffect } from 'react'
import { activateLocale, i18n } from '@/i18n'
import { useAppStore } from '@/store/useAppStore'

interface I18nProviderWrapperProps {
  children: ReactNode
}

export function I18nProviderWrapper({ children }: I18nProviderWrapperProps) {
  const { language } = useAppStore()

  useEffect(() => {
    // Load the language dynamically when it changes
    activateLocale(language)
  }, [language])

  return (
    <I18nProvider i18n={i18n} key={`${i18n.locale}-${language}`}>
      {children}
    </I18nProvider>
  )
}
