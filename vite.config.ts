import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [
		sdk({
			internalDependencies: [
				"@prismicio/client",
				"meow",
				"node-fetch",
				"quick-lru",
			],
		}),
	],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				cli: "./src/cli/index.ts",
			},
		},
	},
	test: {
		coverage: {
			provider: "c8",
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__"],
	},
});
