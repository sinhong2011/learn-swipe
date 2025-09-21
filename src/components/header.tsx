import { SidebarTrigger } from '@/components/animate-ui/components/radix/sidebar'
import { AppBreadcrumbs } from '@/components/app-breadcrumbs'
import { UploadModal } from '@/components/upload-modal'
import { useAppStore } from '@/store/useAppStore'
import { ThemeToggle } from './theme-toggle'

export default function Header() {
  const { isUploadModalOpen, setUploadModalOpen } = useAppStore()

  return (
    <>
      <header className="px-4 py-2 flex gap-2 bg-background border-b border-border justify-between md:rounded-t-2xl">
        <nav className="flex flex-row items-center gap-3 min-w-0">
          <SidebarTrigger />
          <div className="hidden sm:block h-5 w-px bg-border" />
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            <AppBreadcrumbs />
          </div>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <UploadModal open={isUploadModalOpen} onOpenChange={setUploadModalOpen} />
    </>
  )
}
