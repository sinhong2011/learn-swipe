// Simple test script to verify upload functionality

import { dbHelpers, nextReviewAfterDays } from "./lib/dexie-db";
import { parseCsv, rowsToCards, validateAnkiLike } from "./utils/csv";

export async function testUploadFunctionality() {
	console.log("Testing upload functionality...");

	// Test CSV parsing
	const testCsv = `Front,Back,Tags
What is the capital of France?,Paris,Geography
What is 2 + 2?,4,Math
What is the largest planet?,Jupiter,Science`;

	try {
		console.log("1. Testing CSV parsing...");
		const parsed = parseCsv(testCsv);
		console.log("Parsed headers:", parsed.headers);
		console.log("Parsed rows:", parsed.rows);

		console.log("2. Testing row to cards conversion...");
		const cards = rowsToCards(parsed.headers, parsed.rows);
		console.log("Converted cards:", cards);

		console.log("3. Testing validation...");
		const validation = validateAnkiLike(cards);
		console.log("Validation result:", validation);

		if (!validation.ok) {
			throw new Error(validation.message);
		}

		console.log("4. Testing deck creation...");
		const deck = await dbHelpers.createDeck("Test Deck");
		console.log("Created deck:", deck);

		console.log("5. Testing card addition...");
		const count = await dbHelpers.addCards(
			deck.deck_id,
			cards.map((card) => ({
				deck_id: deck.deck_id,
				question: card.question,
				answer: card.answer,
				extra_fields: card.extra_fields,
				interval: 1,
				next_review: nextReviewAfterDays(0),
			})),
		);
		console.log("Added cards count:", count);

		console.log("6. Testing deck listing...");
		const decks = await dbHelpers.listDecks();
		console.log("All decks:", decks);

		console.log("✅ All tests passed!");
		return true;
	} catch (error) {
		console.error("❌ Test failed:", error);
		return false;
	}
}
