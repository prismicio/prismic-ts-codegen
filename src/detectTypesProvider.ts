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
	const require = createRequire(config.cwd || process.cwd());

	if (
		// Only @prismicio/client >= v7 exports types.
		Number.parseInt(
			require("@prismicio/client/package.json").version.split(".")[0],
		) >= 7
	) {
		return "@prismicio/client";
	} else if (require.resolve("@prismicio/types")) {
		return "@prismicio/types";
	}
};
