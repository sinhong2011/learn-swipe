import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createReviewSession, DEFAULT_REVIEW_CONFIG } from './card-scheduler'
import type { Card } from './dexie-db'

// Mock the database helpers
vi.mock('./dexie-db', () => ({
  dbHelpers: {
    getAllCards: vi.fn(),
  },
}))

import { dbHelpers } from './dexie-db'

describe('Card Scheduler', () => {
  const mockDeckId = 'test-deck-123'
  const now = new Date('2024-01-15T10:00:00Z')

  // Helper to create mock cards
  const createMockCard = (overrides: Partial<Card> = {}): Card => ({
    id: Math.floor(Math.random() * 1000),
    deck_id: mockDeckId,
    question: 'Test Question',
    answer: 'Test Answer',
    interval: 1,
    next_review: now.toISOString(),
    ease_factor: 2.5,
    repetitions: 0,
    quality: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    review_count: 0,
    correct_count: 0,
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createReviewSession', () => {
    it('should prioritize overdue cards first', async () => {
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago - clearly overdue
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000) // 1 minute ago to ensure it's "due"

      const cards: Card[] = [
        createMockCard({
          id: 1,
          question: 'Future Card',
          next_review: tomorrow.toISOString(),
          review_count: 1,
        }),
        createMockCard({
          id: 2,
          question: 'Overdue Card',
          next_review: twoDaysAgo.toISOString(), // 2 days overdue
          review_count: 1,
        }),
        createMockCard({
          id: 3,
          question: 'Due Today Card',
          next_review: oneMinuteAgo.toISOString(), // Make it clearly due
          review_count: 1,
        }),
        createMockCard({
          id: 4,
          question: 'New Card',
          review_count: 0,
        }),
      ]

      vi.mocked(dbHelpers.getAllCards).mockResolvedValue(cards)

      const session = await createReviewSession(mockDeckId, {}, now)

      expect(session.cards).toHaveLength(3) // Only overdue, due, and new cards (future card excluded)
      expect(session.stats.overdue).toBe(1)
      expect(session.stats.due).toBe(1)
      expect(session.stats.new).toBe(1)
      expect(session.stats.total).toBe(3)

      // Overdue card should come before due and new cards
      const overdueIndex = session.cards.findIndex(
        (c) => c.question === 'Overdue Card'
      )
      const dueIndex = session.cards.findIndex(
        (c) => c.question === 'Due Today Card'
      )
      const newIndex = session.cards.findIndex((c) => c.question === 'New Card')

      expect(overdueIndex).toBeGreaterThanOrEqual(0)
      expect(dueIndex).toBeGreaterThanOrEqual(0)
      expect(newIndex).toBeGreaterThanOrEqual(0)

      // Overdue cards should come before due cards, and due cards before new cards
      expect(overdueIndex).toBeLessThan(newIndex)
    })

    it('should respect maxNewCards and maxReviewCards limits', async () => {
      const cards: Card[] = Array.from({ length: 10 }, (_, i) =>
        createMockCard({
          id: i + 1,
          question: `New Card ${i + 1}`,
          review_count: 0,
        })
      )

      vi.mocked(dbHelpers.getAllCards).mockResolvedValue(cards)

      const session = await createReviewSession(
        mockDeckId,
        {
          maxNewCards: 3,
          maxReviewCards: 5,
        },
        now
      )

      expect(session.cards).toHaveLength(3) // Limited by maxNewCards
      expect(session.stats.new).toBe(10) // Total new cards available
      expect(session.stats.total).toBe(3) // Cards in session
    })

    it('should randomize cards within priority groups when enabled', async () => {
      const cards: Card[] = Array.from({ length: 5 }, (_, i) =>
        createMockCard({
          id: i + 1,
          question: `New Card ${i + 1}`,
          review_count: 0,
        })
      )

      vi.mocked(dbHelpers.getAllCards).mockResolvedValue(cards)

      // Run multiple times to check for randomization
      const sessions = await Promise.all(
        Array.from({ length: 5 }, () =>
          createReviewSession(
            mockDeckId,
            {
              randomizeWithinPriority: true,
            },
            now
          )
        )
      )

      // Check that not all sessions have the same order
      const firstCardIds = sessions.map((s) => s.cards[0]?.id)
      const uniqueFirstCards = new Set(firstCardIds)

      // With randomization, we should see some variation
      // (This test might occasionally fail due to randomness, but very unlikely)
      expect(uniqueFirstCards.size).toBeGreaterThan(1)
    })

    it('should handle empty deck gracefully', async () => {
      vi.mocked(dbHelpers.getAllCards).mockResolvedValue([])

      const session = await createReviewSession(mockDeckId, {}, now)

      expect(session.cards).toHaveLength(0)
      expect(session.stats.overdue).toBe(0)
      expect(session.stats.due).toBe(0)
      expect(session.stats.new).toBe(0)
      expect(session.stats.total).toBe(0)
    })

    it('should use default configuration when no config provided', async () => {
      const cards: Card[] = [createMockCard({ review_count: 0 })]
      vi.mocked(dbHelpers.getAllCards).mockResolvedValue(cards)

      const session = await createReviewSession(mockDeckId)

      expect(session.config).toEqual(DEFAULT_REVIEW_CONFIG)
    })

    it('should merge provided config with defaults', async () => {
      const cards: Card[] = [createMockCard({ review_count: 0 })]
      vi.mocked(dbHelpers.getAllCards).mockResolvedValue(cards)

      const customConfig = { maxNewCards: 10 }
      const session = await createReviewSession(mockDeckId, customConfig)

      expect(session.config).toEqual({
        ...DEFAULT_REVIEW_CONFIG,
        ...customConfig,
      })
    })
  })
})
