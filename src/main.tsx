import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { I18nProviderWrapper } from '@/components/i18n-provider-wrapper'

// Import the generated route tree
import { routeTree } from './routeTree.gen.ts'

import '@/assets/styles/global.css'
import { ThemeProvider } from '@/components/theme-provider'
import { useAppStore } from '@/store/useAppStore'
import { activateLocale, i18n } from './i18n'
import reportWebVitals from './reportWebVitals.ts'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Initialize language from stored preference
const storedLanguage = useAppStore.getState().language
if (storedLanguage && storedLanguage !== i18n.locale) {
  // Use async activation to load translations dynamically
  activateLocale(storedLanguage).catch((error) => {
    console.error('Failed to activate stored language:', error)
  })
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <I18nProviderWrapper>
          <RouterProvider router={router} />
        </I18nProviderWrapper>
      </ThemeProvider>
    </StrictMode>
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
