// Service worker registration utility
// This file is only imported in production builds

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      // Dynamic import to avoid bundling issues in development
      const { getSerwist } = await import('virtual:serwist')
      const serwist = await getSerwist()

      serwist?.addEventListener('installed', () => {
        console.log('Serwist installed!')
      })

      void serwist?.register()
    } catch (error) {
      console.warn('Service worker not available:', error)
    }
  }
}
