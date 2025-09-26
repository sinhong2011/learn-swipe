import { useLingui } from '@lingui/react/macro'
import { motion } from 'framer-motion'
import { Frown, Meh, RotateCcw, Smile } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { DifficultyLevel } from '@/lib/srs-algorithm'

interface DifficultyRatingProps {
  onRating: (difficulty: DifficultyLevel) => void
  disabled?: boolean
  className?: string
}

export function DifficultyRating({
  onRating,
  disabled = false,
  className = '',
}: DifficultyRatingProps) {
  const { t } = useLingui()

  const buttons = [
    {
      difficulty: DifficultyLevel.AGAIN,
      label: t`Again`,
      shortcut: '1',
      color: 'bg-red-500 hover:bg-red-600 text-white',
      icon: RotateCcw,
      description: t`Incorrect - show again soon`,
    },
    {
      difficulty: DifficultyLevel.HARD,
      label: t`Hard`,
      shortcut: '2',
      color: 'bg-orange-500 hover:bg-orange-600 text-white',
      icon: Frown,
      description: t`Correct but difficult`,
    },
    {
      difficulty: DifficultyLevel.GOOD,
      label: t`Good`,
      shortcut: '3',
      color: 'bg-green-500 hover:bg-green-600 text-white',
      icon: Meh,
      description: t`Correct with slight hesitation`,
    },
    {
      difficulty: DifficultyLevel.EASY,
      label: t`Easy`,
      shortcut: '4',
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      icon: Smile,
      description: t`Perfect recall`,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className={`grid grid-cols-2 gap-3 ${className}`}
    >
      {buttons.map(
        ({ difficulty, label, shortcut, color, icon: Icon, description }) => (
          <Button
            key={difficulty}
            onClick={() => onRating(difficulty)}
            disabled={disabled}
            className={`${color} relative h-16 flex flex-col items-center justify-center gap-1 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95`}
            aria-label={`${label} - ${description}`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
            <span className="absolute top-1 right-2 text-xs opacity-70">
              {shortcut}
            </span>
          </Button>
        )
      )}
    </motion.div>
  )
}

interface DifficultyRatingWithKeyboardProps extends DifficultyRatingProps {
  onKeyPress?: (key: string) => void
}

export function DifficultyRatingWithKeyboard({
  onRating,
  onKeyPress,
  disabled = false,
  className = '',
}: DifficultyRatingWithKeyboardProps) {
  const handleKeyPress = React.useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return

      const key = event.key
      onKeyPress?.(key)

      switch (key) {
        case '1':
          onRating(DifficultyLevel.AGAIN)
          break
        case '2':
          onRating(DifficultyLevel.HARD)
          break
        case '3':
          onRating(DifficultyLevel.GOOD)
          break
        case '4':
          onRating(DifficultyLevel.EASY)
          break
      }
    },
    [disabled, onRating, onKeyPress]
  )

  // Add keyboard event listener
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return (
    <DifficultyRating
      onRating={onRating}
      disabled={disabled}
      className={className}
    />
  )
}
