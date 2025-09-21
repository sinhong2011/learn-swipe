import { describe, it, expect, vi } from "vitest";
import { generateUUID } from "./uuid";

describe("generateUUID", () => {
	it("should generate a valid UUID v4 format", () => {
		const uuid = generateUUID();
		
		// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		
		expect(uuid).toMatch(uuidRegex);
	});

	it("should generate unique UUIDs", () => {
		const uuid1 = generateUUID();
		const uuid2 = generateUUID();
		
		expect(uuid1).not.toBe(uuid2);
	});

	it("should use crypto.randomUUID when available", () => {
		const mockRandomUUID = vi.fn(() => "mock-uuid-from-crypto");
		
		// Mock crypto.randomUUID
		const originalCrypto = global.crypto;
		global.crypto = {
			...originalCrypto,
			randomUUID: mockRandomUUID,
		} as any;

		const uuid = generateUUID();
		
		expect(mockRandomUUID).toHaveBeenCalled();
		expect(uuid).toBe("mock-uuid-from-crypto");
		
		// Restore original crypto
		global.crypto = originalCrypto;
	});

	it("should fallback to custom implementation when crypto.randomUUID is not available", () => {
		// Mock crypto to not have randomUUID
		const originalCrypto = global.crypto;
		global.crypto = {} as any;

		const uuid = generateUUID();
		
		// Should still generate a valid UUID format
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		expect(uuid).toMatch(uuidRegex);
		
		// Restore original crypto
		global.crypto = originalCrypto;
	});
});
