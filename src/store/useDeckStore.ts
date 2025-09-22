import { t } from '@lingui/core/macro'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Card, Deck } from '@/lib/dexie-db'
import { dbHelpers } from '@/lib/dexie-db'

// Types for deck-related state
export interface DeckStats {
  total: number
  mastered: number
  due: number
}

export interface DeckWithStats extends Deck {
  stats?: DeckStats
}

export interface DeckState {
  // Core deck state
  decks: Deck[]
  currentDeck: Deck | null

  // Per-deck UI preferences
  deckBlur: Record<string, boolean> // deckId -> isBlurred

  // Loading states
  isLoading: boolean
  isCreating: boolean
  isDeleting: boolean

  // Error state
  error: string | null

  // Deck operations
  loadDecks: () => Promise<void>
  createDeck: (name: string) => Promise<Deck>
  deleteDeck: (deckId: string) => Promise<void>
  setCurrentDeck: (deck: Deck | null) => void

  // Deck stats operations
  loadDeckStats: (deckId: string) => Promise<DeckStats>
  loadDecksWithStats: () => Promise<DeckWithStats[]>

  // Card operations for the current deck
  addCardsToCurrentDeck: (cards: Omit<Card, 'id'>[]) => Promise<void>
  getDueCardsForDeck: (deckId: string) => Promise<Card[]>

  // UI preferences
  setDeckBlur: (deckId: string, blurred: boolean) => void

  // Utility actions
  clearError: () => void
  refreshDecks: () => Promise<void>
}

export const useDeckStore = create<DeckState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        decks: [],
        currentDeck: null,
        deckBlur: {},
        isLoading: false,
        isCreating: false,
        isDeleting: false,
        error: null,

        // Load all decks from database
        loadDecks: async () => {
          set((draft) => {
            draft.isLoading = true
            draft.error = null
          })

          try {
            const deckList = await dbHelpers.listDecks()
            set((draft) => {
              draft.decks = deckList
              draft.isLoading = false
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : t`Failed to load decks`
            set((draft) => {
              draft.error = errorMessage
              draft.isLoading = false
            })
            throw error
          }
        },

        // Create a new deck
        createDeck: async (name: string) => {
          set((draft) => {
            draft.isCreating = true
            draft.error = null
          })

          try {
            const newDeck = await dbHelpers.createDeck(name)

            set((draft) => {
              draft.decks.push(newDeck)
              draft.currentDeck = newDeck
              draft.isCreating = false
            })

            return newDeck
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to create deck'
            set((draft) => {
              draft.error = errorMessage
              draft.isCreating = false
            })
            throw error
          }
        },

        // Delete a deck
        deleteDeck: async (deckId: string) => {
          set((draft) => {
            draft.isDeleting = true
            draft.error = null
          })

          try {
            await dbHelpers.deleteDeck(deckId)

            set((draft) => {
              draft.decks = draft.decks.filter(
                (deck) => deck.deck_id !== deckId
              )
              if (draft.currentDeck?.deck_id === deckId) {
                draft.currentDeck = null
              }
              draft.isDeleting = false
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to delete deck'
            set((draft) => {
              draft.error = errorMessage
              draft.isDeleting = false
            })
            throw error
          }
        },

        // Set current deck
        setCurrentDeck: (deck: Deck | null) => {
          set((draft) => {
            draft.currentDeck = deck
          })
        },

        // Load stats for a specific deck
        loadDeckStats: async (deckId: string) => {
          try {
            const stats = await dbHelpers.getDeckStats(deckId)
            return stats
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to load deck stats'
            set((draft) => {
              draft.error = errorMessage
            })
            throw error
          }
        },

        // Load all decks with their stats
        loadDecksWithStats: async () => {
          set((draft) => {
            draft.isLoading = true
            draft.error = null
          })

          try {
            const deckList = await dbHelpers.listDecks()

            // Load stats for each deck in parallel
            const decksWithStatsPromises = deckList.map(
              async (deck): Promise<DeckWithStats> => {
                try {
                  const stats = await dbHelpers.getDeckStats(deck.deck_id)
                  return { ...deck, stats }
                } catch (error) {
                  console.warn(
                    `Failed to load stats for deck ${deck.deck_id}:`,
                    error
                  )
                  return { ...deck, stats: undefined }
                }
              }
            )

            const decksWithStats = await Promise.all(decksWithStatsPromises)

            set((draft) => {
              draft.decks = deckList
              draft.isLoading = false
            })

            return decksWithStats
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to load decks with stats'
            set((draft) => {
              draft.error = errorMessage
              draft.isLoading = false
            })
            throw error
          }
        },

        // Add cards to current deck
        addCardsToCurrentDeck: async (cards: Omit<Card, 'id'>[]) => {
          const currentDeck = get().currentDeck
          if (!currentDeck) {
            throw new Error('No current deck selected')
          }

          try {
            await dbHelpers.addCards(currentDeck.deck_id, cards)
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to add cards'
            set((draft) => {
              draft.error = errorMessage
            })
            throw error
          }
        },

        // Get due cards for a specific deck
        getDueCardsForDeck: async (deckId: string) => {
          try {
            const dueCards = await dbHelpers.getDueCards(deckId)
            return dueCards
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to get due cards'
            set((draft) => {
              draft.error = errorMessage
            })
            throw error
          }
        },

        // Clear error state
        clearError: () => {
          set((draft) => {
            draft.error = null
          })
        },

        // Refresh decks (reload from database)
        refreshDecks: async () => {
          await get().loadDecks()
        },

        // Set blur preference for a deck
        setDeckBlur: (deckId: string, blurred: boolean) => {
          set((draft) => {
            draft.deckBlur[deckId] = blurred
          })
        },
      })),
      {
        name: 'deck-store',
        // Only persist core deck state, not loading/error states
        partialize: (state) => ({
          decks: state.decks,
          currentDeck: state.currentDeck,
          deckBlur: state.deckBlur,
        }),
      }
    ),
    {
      name: 'deck-store',
    }
  )
)
