/**
 * Example demonstrating Zustand + Dexie.js integration
 * This shows how the store automatically persists to IndexedDB via Dexie
 */

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDeckStore } from "@/store/useDeckStore";

export function ZustandDexieExample() {
	const {
		decks,
		currentDeck,
		loadDecks,
		createDeck,
		deleteDeck,
		setCurrentDeck,
	} = useDeckStore();

	// Example: Load decks using deck store
	const handleLoadDecks = async () => {
		try {
			await loadDecks();
			console.log("Loaded decks:", decks);
		} catch (error) {
			console.error("Failed to load decks:", error);
		}
	};

	// Example: Create a new deck
	const createExampleDeck = async () => {
		try {
			// Create deck using deck store
			const newDeck = await createDeck("Example Deck");

			// Add some example cards to the current deck
			await useDeckStore.getState().addCardsToCurrentDeck([
				{
					deck_id: newDeck.deck_id,
					question: "What is React?",
					answer: "A JavaScript library for building user interfaces",
					interval: 1,
					next_review: new Date().toISOString(),
				},
				{
					deck_id: newDeck.deck_id,
					question: "What is Zustand?",
					answer: "A small, fast and scalable state management solution",
					interval: 1,
					next_review: new Date().toISOString(),
				},
			]);

			console.log("Created example deck:", newDeck);
		} catch (error) {
			console.error("Failed to create deck:", error);
		}
	};

	// Example: Delete a deck
	const deleteCurrentDeck = async () => {
		if (!currentDeck) return;

		try {
			await deleteDeck(currentDeck.deck_id);
			console.log("Deleted deck:", currentDeck.name);
		} catch (error) {
			console.error("Failed to delete deck:", error);
		}
	};

	// Load decks on component mount
	useEffect(() => {
		loadDecks();
	}, [loadDecks]);

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">
				Zustand + Dexie Integration Example
			</h1>

			<div className="space-y-4">
				{/* Current State Display */}
				<div className="p-4 bg-gray-100 rounded-lg">
					<h2 className="text-lg font-semibold mb-2">Current State</h2>
					<p>
						<strong>Current Deck:</strong> {currentDeck?.name || "None"}
					</p>
					<p>
						<strong>Total Decks:</strong> {decks.length}
					</p>
				</div>

				{/* Actions */}
				<div className="space-y-2">
					<h2 className="text-lg font-semibold">Actions</h2>

					<div className="flex gap-2 flex-wrap">
						<Button onClick={handleLoadDecks}>Reload Decks</Button>

						<Button onClick={createExampleDeck}>Create Example Deck</Button>

						<Button
							onClick={deleteCurrentDeck}
							disabled={!currentDeck}
							variant="destructive"
						>
							Delete Current Deck
						</Button>
					</div>
				</div>

				{/* Decks List */}
				<div>
					<h2 className="text-lg font-semibold mb-2">Decks</h2>
					{decks.length === 0 ? (
						<p className="text-gray-500">
							No decks found. Create one to get started!
						</p>
					) : (
						<div className="space-y-2">
							{decks.map((deck) => (
								<div
									key={deck.deck_id}
									className={`p-3 border rounded-lg cursor-pointer transition-colors ${
										currentDeck?.deck_id === deck.deck_id
											? "bg-blue-100 border-blue-300"
											: "hover:bg-gray-50"
									}`}
									onClick={() => setCurrentDeck(deck)}
								>
									<h3 className="font-medium">{deck.name}</h3>
									<p className="text-sm text-gray-500">ID: {deck.deck_id}</p>
								</div>
							))}
						</div>
					)}
				</div>

				{/* How it works */}
				<div className="p-4 bg-blue-50 rounded-lg">
					<h2 className="text-lg font-semibold mb-2">How it works</h2>
					<ul className="text-sm space-y-1">
						<li>
							• Zustand store state is automatically persisted to IndexedDB via
							Dexie
						</li>
						<li>
							• Changes to decks, currentDeck, and currentTab are saved
							automatically
						</li>
						<li>
							• Upload state and modal state are NOT persisted (reset on app
							restart)
						</li>
						<li>
							• Dexie provides a clean API for complex database operations
						</li>
						<li>
							• Migration utility handles transition from old IndexedDB
							implementation
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

export default ZustandDexieExample;
