import { existsSync } from "fs";
import { resolve as resolvePath } from "path";

import { createJiti } from "jiti";

import type { Config } from "./configSchema";

const jiti = createJiti(process.cwd());

const DEFAULT_CONFIG_PATHS = ["prismicCodegen.config.ts", "prismicCodegen.config.js"];

type LoadConfigConfig = {
	path?: string;
};

export const loadConfig = async (config: LoadConfigConfig): Promise<Config> => {
	if (config.path) {
		if (existsSync(config.path)) {
			return await jiti.import(resolvePath(config.path), { default: true });
		} else {
			throw new Error(`Config file does not exist: ${config.path}`);
		}
	} else {
		for (const configPath of DEFAULT_CONFIG_PATHS) {
			if (existsSync(configPath)) {
				return await jiti.import(resolvePath(configPath), { default: true });
			}
		}
	}

	// If no config file exists, an empty config is returned.
	return {};
};
