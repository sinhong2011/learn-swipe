import { useLingui } from '@lingui/react/macro'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  BarChart3,
  BookOpen,
  Brain,
  Play,
  Settings,
  Upload,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAppStore } from '@/store/useAppStore'
import type { DeckWithStats } from '@/store/useDeckStore'
import { useDeckStore } from '@/store/useDeckStore'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { t } = useLingui()
  const navigate = useNavigate()
  const { setUploadModalOpen } = useAppStore()
  const { loadDecksWithStats } = useDeckStore()
  const [decksWithStats, setDecksWithStats] = useState<DeckWithStats[]>([])
  const [loading, setLoading] = useState(true)
  useDocumentTitle(`${t`Home`} - LearnSwipe`)

  useEffect(() => {
    // Service worker registration only in production
    if (import.meta.env.PROD) {
      const loadSerwist = async () => {
        try {
          const { registerServiceWorker } = await import('@/lib/service-worker')
          await registerServiceWorker()
        } catch (error) {
          console.warn('Service worker registration failed:', error)
        }
      }

      loadSerwist()
    }
  }, [])

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load decks with stats using deck store
        const decksWithStatsData = await loadDecksWithStats()
        setDecksWithStats(decksWithStatsData)
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [loadDecksWithStats])

  const handleStudyDeck = (deckId: string) => {
    navigate({ to: '/study/$deckId', params: { deckId } })
  }

  const handleReviewDeck = (deckId: string) => {
    navigate({ to: '/review/$deckId', params: { deckId } })
  }

  const handleManageDeck = (deckId: string) => {
    navigate({ to: '/manage/$deckId', params: { deckId } })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t`Loading decks...`}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {decksWithStats.length === 0 ? (
        // Welcome screen for new users
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-4">{t`Welcome to LearnSwipe`}</h1>
            <p className="text-lg text-muted-foreground mb-6">
              {t`Your mobile-first flashcard learning companion. Upload your CSV files and start learning with our intuitive Tinder-like swipe interface.`}
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t`Get Started`}
              </CardTitle>
              <CardDescription>
                {t`Upload your first deck to begin your learning journey`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setUploadModalOpen(true)}
                size="lg"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t`Upload Your First Deck`}
              </Button>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 border rounded-lg">
              <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">{t`Upload CSV`}</h3>
              <p className="text-muted-foreground">{t`Support for Anki-style CSV format with Front/Back columns`}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Play className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">{t`Swipe to Learn`}</h3>
              <p className="text-muted-foreground">{t`Intuitive mobile-first interface with smooth swipe gestures`}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">{t`Track Progress`}</h3>
              <p className="text-muted-foreground">{t`Spaced repetition system to optimize your learning`}</p>
            </div>
          </div>
        </div>
      ) : (
        // Deck management view
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t`Your Decks`}</h1>
            <Button onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              {t`Add Deck`}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decksWithStats.map((deck) => (
              <Card
                key={deck.deck_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{deck.name}</CardTitle>
                  {deck.stats && (
                    <CardDescription>
                      {t`${deck.stats.total} cards • ${deck.stats.mastered} mastered • ${deck.stats.due} due`}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReviewDeck(deck.deck_id)}
                        className="flex-1"
                        variant={deck.stats?.due === 0 ? 'outline' : 'default'}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        {t`Review`}
                      </Button>
                      <Button
                        onClick={() => handleStudyDeck(deck.deck_id)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t`Study`}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleManageDeck(deck.deck_id)}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t`Manage Cards`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
