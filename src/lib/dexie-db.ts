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
}

// Dexie database class
export class LearnSwipeDB extends Dexie {
  // Tables
  decks!: EntityTable<Deck, 'deck_id'>
  cards!: EntityTable<Card, 'id'>

  constructor() {
    super('LearnSwipeDB')

    this.version(1).stores({
      decks: 'deck_id, name',
      cards: '++id, deck_id, question, answer, interval, next_review',
    })

    // Add hooks for data validation if needed
    this.cards.hook('creating', (_primKey, obj, _trans) => {
      // Ensure required fields are present
      if (!obj.deck_id || !obj.question || !obj.answer) {
        throw new Error('Missing required card fields')
      }
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

  async getDeckStats(
    deck_id: string
  ): Promise<{ total: number; mastered: number; due: number }> {
    const cards = await db.cards.where('deck_id').equals(deck_id).toArray()
    const now = new Date().toISOString()

    const total = cards.length
    const mastered = cards.filter((c) => c.interval > 1).length
    const due = cards.filter(
      (c) => !c.next_review || c.next_review <= now
    ).length

    return { total, mastered, due }
  },
}

// Utility function for next review date
export function nextReviewAfterDays(days: number, from = new Date()): string {
  const d = new Date(from)
  // Allow 0 days for immediate review, otherwise minimum 1 day
  d.setDate(d.getDate() + (days === 0 ? 0 : Math.max(1, Math.round(days))))
  return d.toISOString()
}

// Spaced Repetition System (SRS) algorithm
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
