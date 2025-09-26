import type { Card } from './dexie-db'
import { dbHelpers } from './dexie-db'
import {
  calculateCardPriority,
  getCardsForReview,
  sortCardsByPriority,
} from './srs-algorithm'

/**
 * Configuration for review sessions
 */
export interface ReviewSessionConfig {
  maxNewCards: number // Maximum new cards to introduce per session
  maxReviewCards: number // Maximum review cards per session
  randomizeWithinPriority: boolean // Whether to randomize cards within same priority level
  includeOverdue: boolean // Whether to include overdue cards
  includeDue: boolean // Whether to include due cards
  includeNew: boolean // Whether to include new cards
}

/**
 * Default configuration for review sessions
 */
export const DEFAULT_REVIEW_CONFIG: ReviewSessionConfig = {
  maxNewCards: 20,
  maxReviewCards: 100,
  randomizeWithinPriority: true,
  includeOverdue: true,
  includeDue: true,
  includeNew: true,
}

/**
 * Information about a review session
 */
export interface ReviewSession {
  cards: Card[]
  stats: {
    overdue: number
    due: number
    new: number
    total: number
  }
  config: ReviewSessionConfig
}

/**
 * Create a review session for a deck with proper SRS scheduling
 */
export async function createReviewSession(
  deckId: string,
  config: Partial<ReviewSessionConfig> = {},
  now = new Date()
): Promise<ReviewSession> {
  const fullConfig = { ...DEFAULT_REVIEW_CONFIG, ...config }
  const allCards = await dbHelpers.getAllCards(deckId)

  // Categorize cards
  const nowISO = now.toISOString()
  const overdueCards: Card[] = []
  const dueCards: Card[] = []
  const newCards: Card[] = []

  for (const card of allCards) {
    const reviewCount = card.review_count || 0
    const nextReview = card.next_review

    if (reviewCount === 0) {
      newCards.push(card)
    } else if (!nextReview || nextReview < nowISO) {
      const daysDiff = nextReview
        ? Math.floor(
            (now.getTime() - new Date(nextReview).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0

      if (daysDiff > 0) {
        overdueCards.push(card)
      } else {
        dueCards.push(card)
      }
    }
  }

  // Build session cards based on configuration
  const sessionCards: Card[] = []

  // Add overdue cards (highest priority)
  if (fullConfig.includeOverdue) {
    const sortedOverdue = sortCardsByPriority(overdueCards, now)
    sessionCards.push(...sortedOverdue.slice(0, fullConfig.maxReviewCards))
  }

  // Add due cards
  if (
    fullConfig.includeDue &&
    sessionCards.length < fullConfig.maxReviewCards
  ) {
    const remaining = fullConfig.maxReviewCards - sessionCards.length
    const sortedDue = sortCardsByPriority(dueCards, now)
    sessionCards.push(...sortedDue.slice(0, remaining))
  }

  // Add new cards
  if (
    fullConfig.includeNew &&
    sessionCards.length < fullConfig.maxReviewCards
  ) {
    const remainingSlots = Math.min(
      fullConfig.maxNewCards,
      fullConfig.maxReviewCards - sessionCards.length
    )

    // Randomize new cards since they have no SRS history
    const shuffledNew = [...newCards].sort(() => Math.random() - 0.5)
    sessionCards.push(...shuffledNew.slice(0, remainingSlots))
  }

  // Apply final randomization within priority groups if configured
  let finalCards = sessionCards
  if (fullConfig.randomizeWithinPriority) {
    finalCards = randomizeWithinPriorityGroups(sessionCards, now)
  }

  return {
    cards: finalCards,
    stats: {
      overdue: overdueCards.length,
      due: dueCards.length,
      new: newCards.length,
      total: finalCards.length,
    },
    config: fullConfig,
  }
}

/**
 * Randomize cards within their priority groups to add variety while maintaining SRS order
 */
function randomizeWithinPriorityGroups(
  cards: Card[],
  now = new Date()
): Card[] {
  // Group cards by priority level
  const priorityGroups = new Map<number, Card[]>()

  for (const card of cards) {
    const priority = Math.floor(calculateCardPriority(card, now) / 1000) // Group by thousands
    if (!priorityGroups.has(priority)) {
      priorityGroups.set(priority, [])
    }
    const group = priorityGroups.get(priority)
    if (group) {
      group.push(card)
    }
  }

  // Randomize within each group and combine
  const result: Card[] = []
  const sortedPriorities = Array.from(priorityGroups.keys()).sort(
    (a, b) => a - b
  )

  for (const priority of sortedPriorities) {
    const group = priorityGroups.get(priority)
    if (group) {
      const shuffled = [...group].sort(() => Math.random() - 0.5)
      result.push(...shuffled)
    }
  }

  return result
}

/**
 * Get the next card to review from a session
 */
export function getNextCard(
  session: ReviewSession,
  currentIndex: number
): Card | null {
  if (currentIndex >= session.cards.length) {
    return null
  }
  return session.cards[currentIndex]
}

/**
 * Check if there are more cards to review in the session
 */
export function hasMoreCards(
  session: ReviewSession,
  currentIndex: number
): boolean {
  return currentIndex < session.cards.length
}

/**
 * Get session progress information
 */
export function getSessionProgress(
  session: ReviewSession,
  currentIndex: number
): {
  current: number
  total: number
  percentage: number
  remaining: number
} {
  const current = Math.min(currentIndex + 1, session.cards.length)
  const total = session.cards.length
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0
  const remaining = Math.max(0, total - current)

  return { current, total, percentage, remaining }
}

/**
 * Get cards that need review today for a deck
 */
export async function getTodayReviewCards(
  deckId: string,
  now = new Date()
): Promise<Card[]> {
  const allCards = await dbHelpers.getAllCards(deckId)
  return getCardsForReview(allCards, now)
}

/**
 * Get enhanced deck statistics with SRS information
 */
export async function getEnhancedDeckStats(
  deckId: string,
  now = new Date()
): Promise<{
  total: number
  new: number
  learning: number
  young: number
  mature: number
  due: number
  overdue: number
}> {
  const allCards = await dbHelpers.getAllCards(deckId)
  const nowISO = now.toISOString()

  const stats = {
    total: allCards.length,
    new: 0,
    learning: 0,
    young: 0,
    mature: 0,
    due: 0,
    overdue: 0,
  }

  for (const card of allCards) {
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
    if (!nextReview || nextReview <= nowISO) {
      if (reviewCount === 0) {
        // New cards count as due
        stats.due++
      } else if (nextReview && nextReview < nowISO) {
        stats.overdue++
      } else {
        stats.due++
      }
    }
  }

  return stats
}
