/* Tiny IndexedDB wrapper for LearnSwipe */

import { generateUUID } from "@/lib/uuid";

export type Deck = {
	deck_id: string;
	name: string;
};

export type Card = {
	id?: number;
	deck_id: string;
	question: string;
	answer: string;
	extra_fields?: Record<string, unknown>;
	interval: number; // in days
	next_review: string; // ISO date
};

const DB_NAME = "learnSwipe";
const DB_VERSION = 1;

function withDB(
	cb: (db: IDBDatabase) => void,
	onError: (err: unknown) => void,
) {
	const openReq = indexedDB.open(DB_NAME, DB_VERSION);
	openReq.onupgradeneeded = () => {
		const db = openReq.result;
		if (!db.objectStoreNames.contains("decks")) {
			db.createObjectStore("decks", { keyPath: "deck_id" });
		}
		if (!db.objectStoreNames.contains("cards")) {
			const store = db.createObjectStore("cards", {
				keyPath: "id",
				autoIncrement: true,
			});
			store.createIndex("by_deck", "deck_id", { unique: false });
			store.createIndex("by_next_review", "next_review", { unique: false });
		}
	};
	openReq.onsuccess = () => cb(openReq.result);
	openReq.onerror = () => onError(openReq.error);
}

export async function createDeck(name: string): Promise<Deck> {
	return new Promise((resolve, reject) => {
		withDB((db) => {
			const tx = db.transaction(["decks"], "readwrite");
			const decks = tx.objectStore("decks");
			const deck: Deck = { deck_id: generateUUID(), name };
			decks.put(deck);
			tx.oncomplete = () => resolve(deck);
			tx.onerror = () => reject(tx.error);
		}, reject);
	});
}

export async function listDecks(): Promise<Deck[]> {
	return new Promise((resolve, reject) => {
		withDB((db) => {
			const tx = db.transaction(["decks"], "readonly");
			const decks = tx.objectStore("decks");
			const req = decks.getAll();
			req.onsuccess = () => resolve(req.result as Deck[]);
			req.onerror = () => reject(req.error);
		}, reject);
	});
}

export async function addCards(
	deck_id: string,
	cards: Omit<Card, "id">[],
): Promise<number> {
	return new Promise((resolve, reject) => {
		withDB((db) => {
			const tx = db.transaction(["cards"], "readwrite");
			const store = tx.objectStore("cards");
			let count = 0;
			for (const c of cards) {
				store.add({ ...c, deck_id });
				count++;
			}
			tx.oncomplete = () => resolve(count);
			tx.onerror = () => reject(tx.error);
		}, reject);
	});
}

export async function getDueCards(
	deck_id: string,
	now = new Date(),
): Promise<Card[]> {
	return new Promise((resolve, reject) => {
		withDB((db) => {
			const tx = db.transaction(["cards"], "readonly");
			const store = tx.objectStore("cards");
			const idx = store.index("by_deck");
			const req = idx.getAll(IDBKeyRange.only(deck_id));
			req.onsuccess = () => {
				const isoNow = now.toISOString();
				const all = (req.result as Card[]).filter(
					(c) => !c.next_review || c.next_review <= isoNow,
				);
				resolve(all);
			};
			req.onerror = () => reject(req.error);
		}, reject);
	});
}

export async function updateCard(
	cardId: number,
	updates: Partial<Card>,
): Promise<void> {
	return new Promise((resolve, reject) => {
		withDB((db) => {
			const tx = db.transaction(["cards"], "readwrite");
			const store = tx.objectStore("cards");
			const getReq = store.get(cardId);
			getReq.onsuccess = () => {
				const current = getReq.result as Card | undefined;
				if (!current) {
					resolve();
					return;
				}
				const next = { ...current, ...updates };
				store.put(next);
			};
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		}, reject);
	});
}

export function nextReviewAfterDays(days: number, from = new Date()): string {
	const d = new Date(from);
	d.setDate(d.getDate() + Math.max(1, Math.round(days)));
	return d.toISOString();
}

export function applySRS(
	card: Card,
	correct: boolean,
	when = new Date(),
): Pick<Card, "interval" | "next_review"> {
	if (correct) {
		const nextInterval = Math.max(1, (card.interval || 1) * 2);
		return {
			interval: nextInterval,
			next_review: nextReviewAfterDays(nextInterval, when),
		};
	}
	return { interval: 1, next_review: nextReviewAfterDays(1, when) };
}

export async function deleteDeck(deck_id: string): Promise<void> {
	return new Promise((resolve, reject) => {
		withDB((db) => {
			const tx = db.transaction(["decks", "cards"], "readwrite");

			// Delete all cards in the deck
			const cardsStore = tx.objectStore("cards");
			const cardsIndex = cardsStore.index("by_deck");
			const cardsReq = cardsIndex.getAll(IDBKeyRange.only(deck_id));

			cardsReq.onsuccess = () => {
				const cards = cardsReq.result as Card[];
				for (const card of cards) {
					if (card.id) {
						cardsStore.delete(card.id);
					}
				}

				// Delete the deck
				const decksStore = tx.objectStore("decks");
				decksStore.delete(deck_id);
			};

			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		}, reject);
	});
}

export async function getCardCount(deck_id: string): Promise<number> {
	return new Promise((resolve, reject) => {
		withDB((db) => {
			const tx = db.transaction(["cards"], "readonly");
			const store = tx.objectStore("cards");
			const idx = store.index("by_deck");
			const req = idx.count(IDBKeyRange.only(deck_id));
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		}, reject);
	});
}

export async function getDeckStats(
	deck_id: string,
): Promise<{ total: number; mastered: number; due: number }> {
	return new Promise((resolve, reject) => {
		withDB((db) => {
			const tx = db.transaction(["cards"], "readonly");
			const store = tx.objectStore("cards");
			const idx = store.index("by_deck");
			const req = idx.getAll(IDBKeyRange.only(deck_id));

			req.onsuccess = () => {
				const cards = req.result as Card[];
				const now = new Date().toISOString();

				const total = cards.length;
				const mastered = cards.filter((c) => c.interval > 1).length;
				const due = cards.filter(
					(c) => !c.next_review || c.next_review <= now,
				).length;

				resolve({ total, mastered, due });
			};
			req.onerror = () => reject(req.error);
		}, reject);
	});
}
