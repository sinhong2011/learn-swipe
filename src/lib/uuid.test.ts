import { describe, expect, it } from "vitest";
import { generateUUID } from "./uuid";

describe("generateUUID", () => {
	it("should generate a valid UUID v4 format", () => {
		const uuid = generateUUID();

		// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

		expect(uuid).toMatch(uuidRegex);
		expect(uuid).toHaveLength(36); // Standard UUID length
	});

	it("should generate unique UUIDs", () => {
		const uuid1 = generateUUID();
		const uuid2 = generateUUID();
		const uuid3 = generateUUID();

		expect(uuid1).not.toBe(uuid2);
		expect(uuid2).not.toBe(uuid3);
		expect(uuid1).not.toBe(uuid3);
	});

	it("should generate UUIDs with correct version (v4)", () => {
		const uuid = generateUUID();

		// The 13th character should be '4' for UUID v4
		expect(uuid.charAt(14)).toBe("4");
	});

	it("should generate UUIDs with correct variant", () => {
		const uuid = generateUUID();

		// The 17th character should be 8, 9, a, or b for RFC 4122 variant
		const variantChar = uuid.charAt(19).toLowerCase();
		expect(["8", "9", "a", "b"]).toContain(variantChar);
	});
});
