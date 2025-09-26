import { useLingui } from '@lingui/react/macro'
import { BarChart3, Calendar, Edit, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Card as CardType } from '@/lib/dexie-db'

interface CardListProps {
  cards: CardType[]
  onEdit: (card: CardType) => void
  onDelete: (card: CardType) => void
  loading?: boolean
  className?: string
}

export function CardList({
  cards,
  onEdit,
  onDelete,
  loading = false,
  className = '',
}: CardListProps) {
  const { t } = useLingui()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<
    'created' | 'updated' | 'interval' | 'question'
  >('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter cards based on search term
  const filteredCards = cards.filter(
    (card) =>
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortBy) {
      case 'created':
        aValue = a.created_at || ''
        bValue = b.created_at || ''
        break
      case 'updated':
        aValue = a.updated_at || ''
        bValue = b.updated_at || ''
        break
      case 'interval':
        aValue = a.interval || 0
        bValue = b.interval || 0
        break
      case 'question':
        aValue = a.question.toLowerCase()
        bValue = b.question.toLowerCase()
        break
      default:
        aValue = a.created_at || ''
        bValue = b.created_at || ''
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return t`Unknown`
    }
  }

  const getCardStatusColor = (card: CardType) => {
    const reviewCount = card.review_count || 0
    const interval = card.interval || 1

    if (reviewCount === 0) return 'text-blue-600' // New
    if (interval < 21) return 'text-orange-600' // Learning
    if (interval < 100) return 'text-green-600' // Young
    return 'text-purple-600' // Mature
  }

  const getCardStatusText = (card: CardType) => {
    const reviewCount = card.review_count || 0
    const interval = card.interval || 1

    if (reviewCount === 0) return t`New`
    if (interval < 21) return t`Learning`
    if (interval < 100) return t`Young`
    return t`Mature`
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and sort controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t`Search cards...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | 'created'
                  | 'updated'
                  | 'interval'
                  | 'question'
              )
            }
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="created">{t`Created`}</option>
            <option value="updated">{t`Updated`}</option>
            <option value="interval">{t`Interval`}</option>
            <option value="question">{t`Question`}</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        {searchTerm
          ? t`Showing ${sortedCards.length} of ${cards.length} cards`
          : t`${cards.length} cards total`}
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {sortedCards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm
              ? t`No cards match your search.`
              : t`No cards in this deck.`}
          </div>
        ) : (
          sortedCards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <CardTitle className="text-base break-words overflow-hidden">
                      <div
                        className="leading-tight"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word',
                        }}
                      >
                        {card.question}
                      </div>
                    </CardTitle>
                    <CardDescription className="mt-1 overflow-hidden">
                      <div
                        className="leading-tight"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word',
                        }}
                      >
                        {card.answer}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(card)}
                      aria-label={t`Edit card`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(card)}
                      aria-label={t`Delete card`}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <span className={getCardStatusColor(card)}>
                      {getCardStatusText(card)}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <BarChart3 className="h-3 w-3" />
                      {t`${card.interval || 1}d interval`}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      {formatDate(card.updated_at || card.created_at || '')}
                    </span>
                  </div>
                  <div className="whitespace-nowrap">
                    {t`${card.correct_count || 0}/${card.review_count || 0} correct`}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
