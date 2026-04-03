import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		index: "./src/index.ts",
		cli: "./src/cli/index.ts",
	},
	format: ["esm", "cjs"],
	platform: "neutral",
	unbundle: true,
	sourcemap: true,
	exports: {
		exclude: ["cli"],
	},
});
