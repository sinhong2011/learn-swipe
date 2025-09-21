import { t } from "@lingui/core/macro";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Card, Deck } from "@/lib/dexie-db";
import { dbHelpers } from "@/lib/dexie-db";

// Types for deck-related state
export interface DeckStats {
	total: number;
	mastered: number;
	due: number;
}

export interface DeckWithStats extends Deck {
	stats?: DeckStats;
}

export interface DeckState {
	// Core deck state
	decks: Deck[];
	currentDeck: Deck | null;

	// Per-deck UI preferences
	deckBlur: Record<string, boolean>; // deckId -> isBlurred

	// Loading states
	isLoading: boolean;
	isCreating: boolean;
	isDeleting: boolean;

	// Error state
	error: string | null;

	// Deck operations
	loadDecks: () => Promise<void>;
	createDeck: (name: string) => Promise<Deck>;
	deleteDeck: (deckId: string) => Promise<void>;
	setCurrentDeck: (deck: Deck | null) => void;

	// Deck stats operations
	loadDeckStats: (deckId: string) => Promise<DeckStats>;
	loadDecksWithStats: () => Promise<DeckWithStats[]>;

	// Card operations for the current deck
	addCardsToCurrentDeck: (cards: Omit<Card, "id">[]) => Promise<void>;
	getDueCardsForDeck: (deckId: string) => Promise<Card[]>;

	// UI preferences
	setDeckBlur: (deckId: string, blurred: boolean) => void;

	// Utility actions
	clearError: () => void;
	refreshDecks: () => Promise<void>;
}

export const useDeckStore = create<DeckState>()(
	devtools(
		persist(
			(set, get) => ({
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
					set({ isLoading: true, error: null }, false, "loadDecks/start");

					try {
						const deckList = await dbHelpers.listDecks();
						set(
							{
								decks: deckList,
								isLoading: false,
							},
							false,
							"loadDecks/success",
						);
					} catch (error) {
						const errorMessage =
							error instanceof Error ? error.message : t`Failed to load decks`;
						set(
							{
								error: errorMessage,
								isLoading: false,
							},
							false,
							"loadDecks/error",
						);
						throw error;
					}
				},

				// Create a new deck
				createDeck: async (name: string) => {
					set({ isCreating: true, error: null }, false, "createDeck/start");

					try {
						const newDeck = await dbHelpers.createDeck(name);
						const currentDecks = get().decks;

						set(
							{
								decks: [...currentDecks, newDeck],
								currentDeck: newDeck,
								isCreating: false,
							},
							false,
							"createDeck/success",
						);

						return newDeck;
					} catch (error) {
						const errorMessage =
							error instanceof Error ? error.message : "Failed to create deck";
						set(
							{
								error: errorMessage,
								isCreating: false,
							},
							false,
							"createDeck/error",
						);
						throw error;
					}
				},

				// Delete a deck
				deleteDeck: async (deckId: string) => {
					set({ isDeleting: true, error: null }, false, "deleteDeck/start");

					try {
						await dbHelpers.deleteDeck(deckId);
						const currentDecks = get().decks;
						const currentDeck = get().currentDeck;

						const updatedDecks = currentDecks.filter(
							(deck) => deck.deck_id !== deckId,
						);
						const updatedCurrentDeck =
							currentDeck?.deck_id === deckId ? null : currentDeck;

						set(
							{
								decks: updatedDecks,
								currentDeck: updatedCurrentDeck,
								isDeleting: false,
							},
							false,
							"deleteDeck/success",
						);
					} catch (error) {
						const errorMessage =
							error instanceof Error ? error.message : "Failed to delete deck";
						set(
							{
								error: errorMessage,
								isDeleting: false,
							},
							false,
							"deleteDeck/error",
						);
						throw error;
					}
				},

				// Set current deck
				setCurrentDeck: (deck: Deck | null) => {
					set({ currentDeck: deck }, false, "setCurrentDeck");
				},

				// Load stats for a specific deck
				loadDeckStats: async (deckId: string) => {
					try {
						const stats = await dbHelpers.getDeckStats(deckId);
						return stats;
					} catch (error) {
						const errorMessage =
							error instanceof Error
								? error.message
								: "Failed to load deck stats";
						set({ error: errorMessage }, false, "loadDeckStats/error");
						throw error;
					}
				},

				// Load all decks with their stats
				loadDecksWithStats: async () => {
					set(
						{ isLoading: true, error: null },
						false,
						"loadDecksWithStats/start",
					);

					try {
						const deckList = await dbHelpers.listDecks();

						// Load stats for each deck in parallel
						const decksWithStatsPromises = deckList.map(
							async (deck): Promise<DeckWithStats> => {
								try {
									const stats = await dbHelpers.getDeckStats(deck.deck_id);
									return { ...deck, stats };
								} catch (error) {
									console.warn(
										`Failed to load stats for deck ${deck.deck_id}:`,
										error,
									);
									return { ...deck, stats: undefined };
								}
							},
						);

						const decksWithStats = await Promise.all(decksWithStatsPromises);

						set(
							{
								decks: deckList,
								isLoading: false,
							},
							false,
							"loadDecksWithStats/success",
						);

						return decksWithStats;
					} catch (error) {
						const errorMessage =
							error instanceof Error
								? error.message
								: "Failed to load decks with stats";
						set(
							{
								error: errorMessage,
								isLoading: false,
							},
							false,
							"loadDecksWithStats/error",
						);
						throw error;
					}
				},

				// Add cards to current deck
				addCardsToCurrentDeck: async (cards: Omit<Card, "id">[]) => {
					const currentDeck = get().currentDeck;
					if (!currentDeck) {
						throw new Error("No current deck selected");
					}

					try {
						await dbHelpers.addCards(currentDeck.deck_id, cards);
					} catch (error) {
						const errorMessage =
							error instanceof Error ? error.message : "Failed to add cards";
						set({ error: errorMessage }, false, "addCardsToCurrentDeck/error");
						throw error;
					}
				},

				// Get due cards for a specific deck
				getDueCardsForDeck: async (deckId: string) => {
					try {
						const dueCards = await dbHelpers.getDueCards(deckId);
						return dueCards;
					} catch (error) {
						const errorMessage =
							error instanceof Error
								? error.message
								: "Failed to get due cards";
						set({ error: errorMessage }, false, "getDueCardsForDeck/error");
						throw error;
					}
				},

				// Clear error state
				clearError: () => {
					set({ error: null }, false, "clearError");
				},

				// Refresh decks (reload from database)
				refreshDecks: async () => {
					await get().loadDecks();
				},

				// Set blur preference for a deck
				setDeckBlur: (deckId: string, blurred: boolean) => {
					set(
						(prev) => ({ deckBlur: { ...prev.deckBlur, [deckId]: blurred } }),
						false,
						"setDeckBlur",
					);
				},
			}),
			{
				name: "deck-store",
				// Only persist core deck state, not loading/error states
				partialize: (state) => ({
					decks: state.decks,
					currentDeck: state.currentDeck,
					deckBlur: state.deckBlur,
				}),
			},
		),
		{
			name: "deck-store",
		},
	),
);
