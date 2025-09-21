import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDeck } from "./db";

// Mock IndexedDB for testing
const mockDB = {
	transaction: vi.fn(),
	objectStoreNames: { contains: vi.fn(() => false) },
	createObjectStore: vi.fn(() => ({
		createIndex: vi.fn(),
	})),
};

const mockTransaction = {
	objectStore: vi.fn(),
	oncomplete: null as any,
	onerror: null as any,
};

const mockObjectStore = {
	put: vi.fn(),
};

const mockOpenRequest = {
	result: mockDB,
	onupgradeneeded: null as any,
	onsuccess: null as any,
	onerror: null as any,
};

// Mock indexedDB
global.indexedDB = {
	open: vi.fn(() => mockOpenRequest),
} as any;

describe("createDeck", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockTransaction.objectStore.mockReturnValue(mockObjectStore);
		mockDB.transaction.mockReturnValue(mockTransaction);
	});

	it("should create a deck with a valid UUID", async () => {
		// Set up the mock to simulate successful database operations
		setTimeout(() => {
			if (mockOpenRequest.onsuccess) {
				mockOpenRequest.onsuccess();
			}
		}, 0);

		setTimeout(() => {
			if (mockTransaction.oncomplete) {
				mockTransaction.oncomplete();
			}
		}, 10);

		const deckPromise = createDeck("Test Deck");

		// Trigger the success callbacks
		if (mockOpenRequest.onsuccess) {
			mockOpenRequest.onsuccess();
		}
		if (mockTransaction.oncomplete) {
			mockTransaction.oncomplete();
		}

		const deck = await deckPromise;

		expect(deck.name).toBe("Test Deck");
		expect(deck.deck_id).toBeDefined();
		expect(typeof deck.deck_id).toBe("string");
		
		// Check that it's a valid UUID format
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		expect(deck.deck_id).toMatch(uuidRegex);

		// Verify database operations were called
		expect(mockDB.transaction).toHaveBeenCalledWith(["decks"], "readwrite");
		expect(mockTransaction.objectStore).toHaveBeenCalledWith("decks");
		expect(mockObjectStore.put).toHaveBeenCalledWith(deck);
	});
});
