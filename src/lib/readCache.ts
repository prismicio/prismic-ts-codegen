import * as fs from "node:fs";
import * as path from "node:path";

import findCacheDirectory from "find-cache-dir";

import { Cache } from "../types";

import * as pkg from "../../package.json";

export function readCache(): Cache {
	const cacheDir = findCacheDirectory({ name: pkg.name });

	if (!cacheDir) {
		return new Map();
	}

	try {
		fs.mkdirSync(cacheDir, { recursive: true });

		const raw = fs.readFileSync(path.join(cacheDir, "cache.json"), "utf8");

		return new Map(Object.entries(eval("(" + raw + ")")));
	} catch {
		return new Map();
	}
}
