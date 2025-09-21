import { v4 as uuidv4 } from "uuid";

/**
 * Generate a UUID v4 using the npm uuid package
 * This provides a reliable, well-tested UUID implementation
 */
export function generateUUID(): string {
	return uuidv4();
}
