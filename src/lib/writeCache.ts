import * as fs from "node:fs";
import * as path from "node:path";

import findCacheDirectory from "find-cache-dir";

import { Cache } from "../types";

import * as pkg from "../../package.json";

export function writeCache(cache: Cache): void {
	const cacheDir = findCacheDirectory({ name: pkg.name });

	if (!cacheDir) {
		// Caching is a nice-to-have. If it fails, we ignore it.
		return;
	}

	try {
		fs.mkdirSync(cacheDir, { recursive: true });
		fs.writeFileSync(
			path.join(cacheDir, "cache.json"),
			JSON.stringify(Object.fromEntries(cache)),
		);
	} catch {
		// noop - Caching is a nice-to-have. If it fails, we ignore it.
	}
}
