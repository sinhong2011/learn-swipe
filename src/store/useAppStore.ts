import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
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

  // Sidebar state
  sidebarOpen: boolean

  // Actions
  setCurrentTab: (tab: 'study' | 'decks') => void
  setUploadModalOpen: (open: boolean) => void
  setUploadState: (state: Partial<UploadState>) => void
  resetUploadState: () => void
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
  clearBreadcrumbs: () => void
  setLanguage: (language: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
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
      immer((set) => ({
        // Initial state
        upload: initialUploadState,
        currentTab: 'study',
        language: defaultLocale,
        sidebarOpen: true, // Default to open

        isUploadModalOpen: false,
        breadcrumbs: [],

        // Actions
        setCurrentTab: (tab) =>
          set((draft) => {
            draft.currentTab = tab
          }),

        setUploadModalOpen: (open) =>
          set((draft) => {
            draft.isUploadModalOpen = open
          }),

        setUploadState: (state) =>
          set((draft) => {
            Object.assign(draft.upload, state)
          }),

        resetUploadState: () =>
          set((draft) => {
            draft.upload = initialUploadState
          }),

        setBreadcrumbs: (items: BreadcrumbItem[]) =>
          set((draft) => {
            draft.breadcrumbs = items
          }),

        clearBreadcrumbs: () =>
          set((draft) => {
            draft.breadcrumbs = []
          }),

        setLanguage: (language: string) =>
          set((draft) => {
            draft.language = language
          }),

        setSidebarOpen: (open: boolean) =>
          set((draft) => {
            draft.sidebarOpen = open
          }),

        toggleSidebar: () =>
          set((draft) => {
            draft.sidebarOpen = !draft.sidebarOpen
          }),
      })),
      {
        name: 'app-store',
        // Only persist certain parts of the state
        partialize: (state) => ({
          currentTab: state.currentTab,
          language: state.language,
          sidebarOpen: state.sidebarOpen, // Persist sidebar state

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
