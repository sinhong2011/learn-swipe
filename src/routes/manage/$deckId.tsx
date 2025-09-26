import { useLingui } from '@lingui/react/macro'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CardEditor, QuickCardEditor } from '@/components/card-editor'
import { CardList } from '@/components/card-list'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { type Card, db, dbHelpers } from '@/lib/dexie-db'
import { useAppStore } from '@/store/useAppStore'

export const Route = createFileRoute('/manage/$deckId')({
  component: ManagePage,
})

function ManagePage() {
  const { t } = useLingui()
  const { deckId } = useParams({ from: '/manage/$deckId' })
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [deckName, setDeckName] = useState(t`Manage Deck`)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  useDocumentTitle(`${deckName} - Manage - LearnSwipe`)

  // Set global breadcrumbs for Header
  const { setBreadcrumbs, clearBreadcrumbs } = useAppStore()
  useEffect(() => {
    setBreadcrumbs([
      { label: t`Home`, to: '/' },
      { label: t`Decks`, to: '/decks' },
      { label: t`Manage`, to: `/manage/${deckId}` },
      { label: deckName },
    ])
    return () => clearBreadcrumbs()
  }, [deckId, deckName, setBreadcrumbs, clearBreadcrumbs, t])

  // Load deck info and cards
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [deck, deckCards] = await Promise.all([
        db.decks.get(deckId),
        dbHelpers.getAllCards(deckId),
      ])

      setDeckName(deck?.name ?? t`Unknown Deck`)
      setCards(deckCards)
    } catch (error) {
      console.error('Failed to load deck data:', error)
    } finally {
      setLoading(false)
    }
  }, [deckId, t])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddCard = useCallback(
    async (cardData: {
      question: string
      answer: string
      extra_fields?: Record<string, unknown>
    }) => {
      try {
        await dbHelpers.addCard(deckId, {
          question: cardData.question,
          answer: cardData.answer,
          extra_fields: cardData.extra_fields,
          interval: 1,
          next_review: new Date().toISOString(),
          ease_factor: 2.5,
          repetitions: 0,
          quality: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          review_count: 0,
          correct_count: 0,
        })
        await loadData() // Refresh the list
      } catch (error) {
        console.error('Failed to add card:', error)
        throw error
      }
    },
    [deckId, loadData]
  )

  const handleEditCard = useCallback(
    async (cardData: {
      question: string
      answer: string
      extra_fields?: Record<string, unknown>
    }) => {
      if (!editingCard?.id) return

      try {
        await dbHelpers.updateCard(editingCard.id, {
          question: cardData.question,
          answer: cardData.answer,
          extra_fields: cardData.extra_fields,
          updated_at: new Date().toISOString(),
        })
        await loadData() // Refresh the list
        setEditingCard(null)
      } catch (error) {
        console.error('Failed to update card:', error)
        throw error
      }
    },
    [editingCard, loadData]
  )

  const handleDeleteCard = useCallback(
    async (card: Card) => {
      if (!card.id) return

      const confirmed = confirm(
        t`Are you sure you want to delete this card? This action cannot be undone.`
      )

      if (!confirmed) return

      try {
        await dbHelpers.deleteCard(card.id)
        await loadData() // Refresh the list
      } catch (error) {
        console.error('Failed to delete card:', error)
      }
    },
    [loadData, t]
  )

  const handleQuickAdd = useCallback(
    async (cardData: { question: string; answer: string }) => {
      await handleAddCard(cardData)
    },
    [handleAddCard]
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{deckName}</h1>
          <p className="text-muted-foreground">
            {t`Manage your deck's questions and answers`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showQuickAdd ? t`Hide Quick Add` : t`Quick Add`}
          </Button>

          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t`Add Card`}
          </Button>
        </div>
      </div>

      {/* Quick add form */}
      {showQuickAdd && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-4">{t`Quick Add Card`}</h3>
          <QuickCardEditor onSave={handleQuickAdd} />
        </div>
      )}

      <Separator className="mb-6" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">{cards.length}</div>
          <div className="text-sm text-muted-foreground">{t`Total Cards`}</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">
            {cards.filter((c) => (c.review_count || 0) === 0).length}
          </div>
          <div className="text-sm text-muted-foreground">{t`New`}</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">
            {
              cards.filter(
                (c) => (c.interval || 1) < 21 && (c.review_count || 0) > 0
              ).length
            }
          </div>
          <div className="text-sm text-muted-foreground">{t`Learning`}</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">
            {cards.filter((c) => (c.interval || 1) >= 21).length}
          </div>
          <div className="text-sm text-muted-foreground">{t`Mature`}</div>
        </div>
      </div>

      {/* Card list */}
      <CardList
        cards={cards}
        onEdit={setEditingCard}
        onDelete={handleDeleteCard}
        loading={loading}
      />

      {/* Add card dialog */}
      <CardEditor
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleAddCard}
        title={t`Add New Card`}
        description={t`Create a new flashcard for this deck`}
      />

      {/* Edit card dialog */}
      <CardEditor
        card={editingCard}
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSave={handleEditCard}
        title={t`Edit Card`}
        description={t`Modify the question and answer for this card`}
      />
    </div>
  )
}
