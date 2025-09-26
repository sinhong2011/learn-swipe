import Dexie, { type EntityTable } from 'dexie'
import { generateUUID } from '@/lib/uuid'

// Types for our database entities
export interface Deck {
  deck_id: string
  name: string
}

export interface Card {
  id?: number
  deck_id: string
  question: string
  answer: string
  extra_fields?: Record<string, unknown>
  interval: number // in days
  next_review: string // ISO date
  // Enhanced SRS fields
  ease_factor: number // SM-2 ease factor (default 2.5)
  repetitions: number // number of successful reviews in a row
  quality: number // last quality rating (0-5)
  created_at: string // ISO date when card was created
  updated_at: string // ISO date when card was last modified
  review_count: number // total number of reviews
  correct_count: number // number of correct reviews
}

// Dexie database class
export class LearnSwipeDB extends Dexie {
  // Tables
  decks!: EntityTable<Deck, 'deck_id'>
  cards!: EntityTable<Card, 'id'>

  constructor() {
    super('LearnSwipeDB')

    // Version 1: Original schema
    this.version(1).stores({
      decks: 'deck_id, name',
      cards: '++id, deck_id, question, answer, interval, next_review',
    })

    // Version 2: Enhanced SRS schema
    this.version(2)
      .stores({
        decks: 'deck_id, name',
        cards:
          '++id, deck_id, question, answer, interval, next_review, ease_factor, repetitions, quality, created_at, updated_at, review_count, correct_count',
      })
      .upgrade(async (trans) => {
        // Migrate existing cards to new schema with default SRS values
        const cards = await trans.table('cards').toArray()
        const now = new Date().toISOString()

        for (const card of cards) {
          await trans.table('cards').update(card.id, {
            ease_factor: 2.5, // Default SM-2 ease factor
            repetitions: card.interval > 1 ? 1 : 0, // Estimate based on current interval
            quality: 3, // Neutral quality rating
            created_at: now, // Set creation time to migration time
            updated_at: now, // Set update time to migration time
            review_count: card.interval > 1 ? 1 : 0, // Estimate review count
            correct_count: card.interval > 1 ? 1 : 0, // Estimate correct count
          })
        }
      })

    // Add hooks for data validation
    this.cards.hook('creating', (_primKey, obj, _trans) => {
      // Ensure required fields are present
      if (!obj.deck_id || !obj.question || !obj.answer) {
        throw new Error('Missing required card fields')
      }

      // Set default SRS values if not provided
      const now = new Date().toISOString()
      if (obj.ease_factor === undefined) obj.ease_factor = 2.5
      if (obj.repetitions === undefined) obj.repetitions = 0
      if (obj.quality === undefined) obj.quality = 0
      if (obj.created_at === undefined) obj.created_at = now
      if (obj.updated_at === undefined) obj.updated_at = now
      if (obj.review_count === undefined) obj.review_count = 0
      if (obj.correct_count === undefined) obj.correct_count = 0
    })

    this.cards.hook('updating', (_modifications, _primKey, obj, _trans) => {
      // Update the updated_at timestamp on any modification
      obj.updated_at = new Date().toISOString()
    })
  }
}

// Create and export database instance
export const db = new LearnSwipeDB()

// Helper functions for common operations
export const dbHelpers = {
  // Deck operations
  async createDeck(name: string): Promise<Deck> {
    const deck: Deck = {
      deck_id: generateUUID(),
      name,
    }
    await db.decks.add(deck)
    return deck
  },

  async listDecks(): Promise<Deck[]> {
    return await db.decks.toArray()
  },

  async deleteDeck(deck_id: string): Promise<void> {
    await db.transaction('rw', db.decks, db.cards, async () => {
      // Delete all cards in the deck first
      await db.cards.where('deck_id').equals(deck_id).delete()
      // Then delete the deck
      await db.decks.delete(deck_id)
    })
  },

  // Card operations
  async addCards(deck_id: string, cards: Omit<Card, 'id'>[]): Promise<number> {
    const cardsWithDeckId = cards.map((card) => ({ ...card, deck_id }))
    await db.cards.bulkAdd(cardsWithDeckId)
    return cards.length
  },

  async getDueCards(deck_id: string, now = new Date()): Promise<Card[]> {
    const isoNow = now.toISOString()
    return await db.cards
      .where('deck_id')
      .equals(deck_id)
      .filter((card) => !card.next_review || card.next_review <= isoNow)
      .toArray()
  },

  async getAllCards(deck_id: string): Promise<Card[]> {
    return await db.cards.where('deck_id').equals(deck_id).toArray()
  },

  async updateCard(cardId: number, updates: Partial<Card>): Promise<void> {
    await db.cards.update(cardId, updates)
  },

  async getCard(cardId: number): Promise<Card | undefined> {
    return await db.cards.get(cardId)
  },

  async deleteCard(cardId: number): Promise<void> {
    await db.cards.delete(cardId)
  },

  async addCard(
    deck_id: string,
    card: Omit<Card, 'id' | 'deck_id'>
  ): Promise<Card> {
    const now = new Date().toISOString()
    const newCard: Omit<Card, 'id'> = {
      ...card,
      deck_id,
      ease_factor: card.ease_factor ?? 2.5,
      repetitions: card.repetitions ?? 0,
      quality: card.quality ?? 0,
      created_at: card.created_at ?? now,
      updated_at: card.updated_at ?? now,
      review_count: card.review_count ?? 0,
      correct_count: card.correct_count ?? 0,
    }
    const id = await db.cards.add(newCard)
    return { ...newCard, id }
  },

  async getDeckStats(
    deck_id: string
  ): Promise<{ total: number; mastered: number; due: number }> {
    const cards = await db.cards.where('deck_id').equals(deck_id).toArray()
    const now = new Date().toISOString()

    const total = cards.length
    // Consider cards with interval >= 21 days as mastered (mature cards)
    const mastered = cards.filter((c) => (c.interval || 1) >= 21).length
    const due = cards.filter(
      (c) =>
        !c.next_review || c.next_review <= now || (c.review_count || 0) === 0
    ).length

    return { total, mastered, due }
  },

  // Enhanced deck statistics with SRS categories
  async getEnhancedDeckStats(deck_id: string): Promise<{
    total: number
    new: number
    learning: number
    young: number
    mature: number
    due: number
    overdue: number
  }> {
    const cards = await db.cards.where('deck_id').equals(deck_id).toArray()
    const now = new Date().toISOString()

    const stats = {
      total: cards.length,
      new: 0,
      learning: 0,
      young: 0,
      mature: 0,
      due: 0,
      overdue: 0,
    }

    for (const card of cards) {
      const reviewCount = card.review_count || 0
      const interval = card.interval || 1
      const nextReview = card.next_review

      // Categorize by mastery level
      if (reviewCount === 0) {
        stats.new++
      } else if (interval < 21) {
        stats.learning++
      } else if (interval < 100) {
        stats.young++
      } else {
        stats.mature++
      }

      // Check if due or overdue
      if (!nextReview || nextReview <= now) {
        if (reviewCount === 0) {
          // New cards count as due
          stats.due++
        } else if (nextReview && nextReview < now) {
          stats.overdue++
        } else {
          stats.due++
        }
      }
    }

    return stats
  },
}

// Utility function for next review date
export function nextReviewAfterDays(days: number, from = new Date()): string {
  const d = new Date(from)
  // Allow 0 days for immediate review, otherwise minimum 1 day
  d.setDate(d.getDate() + (days === 0 ? 0 : Math.max(1, Math.round(days))))
  return d.toISOString()
}

// Legacy SRS algorithm (kept for backward compatibility)
// Use applySM2Algorithm from srs-algorithm.ts for new implementations
export function applySRS(
  card: Card,
  correct: boolean,
  when = new Date()
): Pick<Card, 'interval' | 'next_review'> {
  if (correct) {
    const nextInterval = Math.max(1, (card.interval || 1) * 2)
    return {
      interval: nextInterval,
      next_review: nextReviewAfterDays(nextInterval, when),
    }
  }
  return { interval: 1, next_review: nextReviewAfterDays(1, when) }
}
