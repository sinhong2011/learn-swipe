import { useLingui } from '@lingui/react/macro'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, CheckCircle, Clock } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { DifficultyRatingWithKeyboard } from '@/components/difficulty-rating'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WaveMask } from '@/components/wave-mask'
import {
  createReviewSession,
  getNextCard,
  getSessionProgress,
  hasMoreCards,
  type ReviewSession,
} from '@/lib/card-scheduler'
import { db, dbHelpers } from '@/lib/dexie-db'
import {
  applySM2Algorithm,
  type DifficultyLevel,
  difficultyToQuality,
} from '@/lib/srs-algorithm'
import { useAppStore } from '@/store/useAppStore'
import { useDeckStore } from '@/store/useDeckStore'

export const Route = createFileRoute('/review/$deckId')({
  component: ReviewPage,
})

function ReviewPage() {
  const { t } = useLingui()
  const navigate = useNavigate()
  const { deckId } = useParams({ from: '/review/$deckId' })
  const [session, setSession] = useState<ReviewSession | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isRating, setIsRating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deckName, setDeckName] = useState(t`Review`)

  // Get blur preference from deck store
  const { deckBlur } = useDeckStore()
  const isBlurred = deckBlur[deckId] ?? false

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const deck = await db.decks.get(deckId)
        if (mounted) setDeckName(deck?.name ?? t`Review`)
      } catch {
        if (mounted) setDeckName(t`Review`)
      }
    })()
    return () => {
      mounted = false
    }
  }, [deckId, t])

  useEffect(() => {
    document.title = `${deckName} - Review - LearnSwipe`
  }, [deckName])

  // Set global breadcrumbs for Header
  const { setBreadcrumbs, clearBreadcrumbs } = useAppStore()
  useEffect(() => {
    setBreadcrumbs([
      { label: t`Home`, to: '/' },
      { label: t`Review`, to: `/review/${deckId}` },
      { label: deckName },
    ])
    return () => clearBreadcrumbs()
  }, [deckId, deckName, setBreadcrumbs, clearBreadcrumbs, t])

  // Initialize review session
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const reviewSession = await createReviewSession(deckId)
        if (mounted) {
          setSession(reviewSession)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to create review session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [deckId])

  const currentCard = session ? getNextCard(session, currentIndex) : null
  const progress = session ? getSessionProgress(session, currentIndex) : null
  const hasMore = session ? hasMoreCards(session, currentIndex) : false

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true)
  }, [])

  const handleDifficultyRating = useCallback(
    async (difficulty: DifficultyLevel) => {
      if (!currentCard || !session || isRating) return

      setIsRating(true)

      try {
        const quality = difficultyToQuality(difficulty)
        const srsUpdate = applySM2Algorithm(currentCard, quality)

        // Update the card in the database
        if (currentCard.id) {
          await dbHelpers.updateCard(currentCard.id, srsUpdate)
        }

        // Move to next card or finish session
        if (hasMore && currentIndex < session.cards.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          setShowAnswer(false)
        } else {
          // Session complete
          navigate({ to: '/decks' })
        }
      } catch (error) {
        console.error('Failed to update card:', error)
      } finally {
        setIsRating(false)
      }
    },
    [currentCard, session, isRating, hasMore, currentIndex, navigate]
  )

  if (loading) {
    return (
      <div className="relative max-w-md mx-auto p-4 pb-24 h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t`Loading review session...`}</p>
      </div>
    )
  }

  if (!session || session.cards.length === 0) {
    return (
      <div className="relative max-w-md mx-auto p-4 pb-24 h-full flex flex-col items-center justify-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-xl font-semibold">{t`No cards to review!`}</h2>
        <p className="text-muted-foreground text-center">
          {t`All cards are up to date. Come back later for more reviews.`}
        </p>
        <Button onClick={() => navigate({ to: '/decks' })}>
          {t`Back to Decks`}
        </Button>
      </div>
    )
  }

  return (
    <div className="relative max-w-md mx-auto p-4 pb-24 h-full space-y-6">
      {/* Header with progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{deckName}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {progress?.current} / {progress?.total}
            </span>
          </div>
        </div>

        {progress && <Progress value={progress.percentage} className="h-2" />}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t`Due: ${session.stats.due + session.stats.overdue}`}</span>
          <span>{t`New: ${session.stats.new}`}</span>
        </div>
      </div>

      {/* Card display */}
      <div className="relative h-[50vh] w-full">
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                <div className="w-full h-full p-6 flex flex-col justify-center">
                  <div className="space-y-6 text-center">
                    <div className="text-lg leading-relaxed font-bold">
                      {currentCard.question}
                    </div>

                    <div className="h-px bg-border" />

                    <button
                      type="button"
                      className="block min-h-16 py-4 cursor-pointer w-full text-left bg-transparent border-none"
                      onClick={handleShowAnswer}
                    >
                      <WaveMask isBlurred={isBlurred && !showAnswer}>
                        <div className="text-base leading-relaxed text-foreground/70 font-light">
                          {currentCard.answer}
                        </div>
                      </WaveMask>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="space-y-4">
        {!showAnswer ? (
          <Button
            onClick={handleShowAnswer}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {t`Show Answer`}
          </Button>
        ) : (
          <DifficultyRatingWithKeyboard
            onRating={handleDifficultyRating}
            disabled={isRating}
            className="w-full"
          />
        )}
      </div>

      {/* Session stats */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4" />
          <span>{t`Progress: ${progress?.percentage}%`}</span>
        </div>
      </div>
    </div>
  )
}
