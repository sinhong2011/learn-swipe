import type { Card } from './dexie-db'
import { nextReviewAfterDays } from './dexie-db'

/**
 * Quality ratings for SM-2 algorithm
 * 0: Complete blackout
 * 1: Incorrect response; the correct one remembered
 * 2: Incorrect response; where the correct one seemed easy to recall
 * 3: Correct response recalled with serious difficulty
 * 4: Correct response after a hesitation
 * 5: Perfect response
 */
export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5

/**
 * Difficulty levels for user interface
 */
export enum DifficultyLevel {
  AGAIN = 'again', // Quality 0-1: Incorrect, show again soon
  HARD = 'hard', // Quality 2-3: Correct but difficult
  GOOD = 'good', // Quality 4: Correct with slight hesitation
  EASY = 'easy', // Quality 5: Perfect recall
}

/**
 * Maps difficulty levels to quality ratings
 */
export function difficultyToQuality(
  difficulty: DifficultyLevel
): QualityRating {
  switch (difficulty) {
    case DifficultyLevel.AGAIN:
      return 1
    case DifficultyLevel.HARD:
      return 3
    case DifficultyLevel.GOOD:
      return 4
    case DifficultyLevel.EASY:
      return 5
  }
}

/**
 * SM-2 Algorithm Implementation
 * Based on the original SuperMemo SM-2 algorithm by Piotr Wozniak
 *
 * @param card The card to update
 * @param quality Quality rating (0-5)
 * @param when When the review occurred (defaults to now)
 * @returns Updated card properties for SRS
 */
export function applySM2Algorithm(
  card: Card,
  quality: QualityRating,
  when = new Date()
): Pick<
  Card,
  | 'interval'
  | 'next_review'
  | 'ease_factor'
  | 'repetitions'
  | 'quality'
  | 'review_count'
  | 'correct_count'
> {
  const isCorrect = quality >= 3
  const newReviewCount = (card.review_count || 0) + 1
  const newCorrectCount = (card.correct_count || 0) + (isCorrect ? 1 : 0)

  let newEaseFactor = card.ease_factor || 2.5
  let newRepetitions = card.repetitions || 0
  let newInterval: number

  if (isCorrect) {
    // Correct response - update ease factor and calculate new interval
    newEaseFactor = Math.max(
      1.3,
      newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    )

    if (newRepetitions === 0) {
      newInterval = 1
      newRepetitions = 1
    } else if (newRepetitions === 1) {
      newInterval = 6
      newRepetitions = 2
    } else {
      newInterval = Math.round((card.interval || 1) * newEaseFactor)
      newRepetitions += 1
    }
  } else {
    // Incorrect response - reset repetitions and set short interval
    newRepetitions = 0
    newInterval = 1
    // Don't change ease factor for incorrect responses in this implementation
    // (some variants do decrease it, but we'll keep it stable)
  }

  return {
    interval: newInterval,
    next_review: nextReviewAfterDays(newInterval, when),
    ease_factor: newEaseFactor,
    repetitions: newRepetitions,
    quality,
    review_count: newReviewCount,
    correct_count: newCorrectCount,
  }
}

/**
 * Calculate the priority score for a card (lower = higher priority)
 * Used for ordering cards in review sessions
 */
export function calculateCardPriority(card: Card, now = new Date()): number {
  const nextReview = new Date(card.next_review)
  const daysDiff = Math.floor(
    (nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Priority categories (lower number = higher priority):
  // 1. Overdue cards (past due date)
  // 2. Due today cards
  // 3. New cards (never reviewed)
  // 4. Future cards (not yet due)

  if (daysDiff < 0) {
    // Overdue cards - priority based on how overdue they are
    return 1000 + Math.abs(daysDiff) // More overdue = higher priority
  } else if (daysDiff === 0) {
    // Due today - priority based on ease factor (harder cards first)
    return 2000 + (card.ease_factor || 2.5) * 100
  } else if ((card.review_count || 0) === 0) {
    // New cards - random order within this category
    return 3000 + Math.random() * 1000
  } else {
    // Future cards - priority based on how far in future (closer = higher priority)
    return 4000 + daysDiff
  }
}

/**
 * Sort cards by SRS priority for review sessions
 */
export function sortCardsByPriority(cards: Card[], now = new Date()): Card[] {
  return [...cards].sort((a, b) => {
    const priorityA = calculateCardPriority(a, now)
    const priorityB = calculateCardPriority(b, now)
    return priorityA - priorityB
  })
}

/**
 * Get cards that are due for review (including overdue and new cards)
 */
export function getCardsForReview(cards: Card[], now = new Date()): Card[] {
  const nowISO = now.toISOString()
  return cards.filter((card) => {
    // Include cards that are due or overdue, or new cards that haven't been reviewed
    return (
      !card.next_review ||
      card.next_review <= nowISO ||
      (card.review_count || 0) === 0
    )
  })
}

/**
 * Get statistics about card mastery levels
 */
export function getCardMasteryStats(cards: Card[]): {
  new: number
  learning: number
  young: number
  mature: number
} {
  const stats = { new: 0, learning: 0, young: 0, mature: 0 }

  for (const card of cards) {
    const reviewCount = card.review_count || 0
    const interval = card.interval || 1

    if (reviewCount === 0) {
      stats.new++
    } else if (interval < 21) {
      stats.learning++
    } else if (interval < 100) {
      stats.young++
    } else {
      stats.mature++
    }
  }

  return stats
}
