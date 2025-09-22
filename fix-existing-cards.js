// Script to fix existing cards that were imported with the bug
// This will update all cards to be due immediately

import { db, nextReviewAfterDays } from './src/lib/dexie-db.js'

async function fixExistingCards() {
  try {
    console.log('Fixing existing cards...')

    // Get all cards
    const allCards = await db.cards.toArray()
    console.log(`Found ${allCards.length} cards`)

    // Update cards that are not due but should be (interval = 1 and next_review is in the future)
    const now = new Date()
    const cardsToFix = allCards.filter((card) => {
      const nextReview = new Date(card.next_review)
      return card.interval === 1 && nextReview > now
    })

    console.log(`Found ${cardsToFix.length} cards to fix`)

    if (cardsToFix.length > 0) {
      // Update these cards to be due now
      for (const card of cardsToFix) {
        await db.cards.update(card.id, {
          next_review: nextReviewAfterDays(0),
        })
      }
      console.log(`Fixed ${cardsToFix.length} cards`)
    }

    console.log('Done!')
  } catch (error) {
    console.error('Error fixing cards:', error)
  }
}

fixExistingCards()
