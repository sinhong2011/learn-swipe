import { BlurAnswerToggle } from '@/components/blur-answer-toggle'

interface StudyPageHeaderProps {
  deckName: string
  isBlurred: boolean
  onBlurToggle: (blurred: boolean) => void
}

export function StudyPageHeader({
  deckName,
  isBlurred,
  onBlurToggle,
}: StudyPageHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Header title and controls (breadcrumb moved to global Header) */}
      <div className="flex items-center justify-between px-2">
        <h1 className="text-xl font-semibold">{deckName}</h1>
        <BlurAnswerToggle isBlurred={isBlurred} onToggle={onBlurToggle} />
      </div>
    </div>
  )
}
