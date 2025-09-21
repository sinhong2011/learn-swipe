/**
 * Generate a UUID v4 compatible with older browsers (including iOS Safari)
 * Falls back to a custom implementation if crypto.randomUUID is not available
 */
export function generateUUID(): string {
	// Try to use the native crypto.randomUUID if available
	if (crypto?.randomUUID) {
		return crypto.randomUUID();
	}

	// Fallback implementation for older browsers
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
