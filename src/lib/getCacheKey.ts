import * as crypto from "node:crypto";

/**
 * Returns a key based on the provided input that can be used as a cache
 * identifier.
 *
 * @param input - The value used to create a key.
 *
 * @returns The cache key.
 */
export const getCacheKey = (input: unknown): string => {
	return crypto.createHash("sha1").update(JSON.stringify(input)).digest("hex");
};
