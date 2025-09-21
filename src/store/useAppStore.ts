import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { defaultLocale } from '@/i18n'

export interface UploadState {
  isUploading: boolean
  progress: number
  status: string | null
  error: string | null
}
export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface AppState {
  // Upload state
  upload: UploadState

  // Navigation state
  currentTab: 'study' | 'decks'

  // Modal state
  isUploadModalOpen: boolean

  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[]

  // Language preference
  language: string

  // Actions
  setCurrentTab: (tab: 'study' | 'decks') => void
  setUploadModalOpen: (open: boolean) => void
  setUploadState: (state: Partial<UploadState>) => void
  resetUploadState: () => void
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
  clearBreadcrumbs: () => void
  setLanguage: (language: string) => void
}

const initialUploadState: UploadState = {
  isUploading: false,
  progress: 0,
  status: null,
  error: null,
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        upload: initialUploadState,
        currentTab: 'study',
        language: defaultLocale,

        isUploadModalOpen: false,
        breadcrumbs: [],

        // Actions
        setCurrentTab: (tab) =>
          set({ currentTab: tab }, false, 'setCurrentTab'),

        setUploadModalOpen: (open) =>
          set({ isUploadModalOpen: open }, false, 'setUploadModalOpen'),

        setUploadState: (state) =>
          set(
            (prev) => ({
              upload: { ...prev.upload, ...state },
            }),
            false,
            'setUploadState'
          ),

        resetUploadState: () =>
          set({ upload: initialUploadState }, false, 'resetUploadState'),

        setBreadcrumbs: (items: BreadcrumbItem[]) =>
          set({ breadcrumbs: items }, false, 'setBreadcrumbs'),
        clearBreadcrumbs: () =>
          set({ breadcrumbs: [] }, false, 'clearBreadcrumbs'),

        setLanguage: (language: string) =>
          set({ language }, false, 'setLanguage'),
      }),
      {
        name: 'app-store',
        // Only persist certain parts of the state
        partialize: (state) => ({
          currentTab: state.currentTab,
          language: state.language,

          // Reset upload state and modal state on app restart
          upload: {
            isUploading: false,
            progress: 0,
            status: null,
            error: null,
          },
          isUploadModalOpen: false,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
)
