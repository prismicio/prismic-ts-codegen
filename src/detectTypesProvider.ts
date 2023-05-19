import { createRequire } from "node:module";

import { TypesProvider } from "./generateTypes";

export type DetectTypesProviderConfig = {
	cwd?: string;
};

/**
 * Detects which types provider should be used for a project.
 *
 * @param config - Configures the detection.
 *
 * @returns The types provider identifier to use, or `undefined` if on cannot be
 *   determined.
 */
export const detectTypesProvider = async (
	config: DetectTypesProviderConfig = {},
): Promise<TypesProvider | undefined> => {
	const cwd = config.cwd || process.cwd();

	const require = createRequire(cwd.endsWith("/") ? cwd : cwd + "/");

	try {
		if (
			Number.parseInt(
				require("@prismicio/client/package.json").version.split(".")[0],
			) >= 7
		) {
			return "@prismicio/client";
		}
	} catch {
		// noop
	}

	try {
		require.resolve("@prismicio/types");

		return "@prismicio/types";
	} catch {
		// noop
	}
};
