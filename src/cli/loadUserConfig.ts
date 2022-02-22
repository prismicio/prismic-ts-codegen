import _jiti from "jiti";
import { existsSync } from "fs";

import type { UserConfig } from "./types";

const jiti = _jiti(process.cwd());

const DEFAULT_CONFIG_PATHS = [
	"prismicCodegen.config.ts",
	"prismicCodegen.config.js",
];

type LoadUserConfigConfig = {
	path?: string;
};

export const loadUserConfig = (config: LoadUserConfigConfig): UserConfig => {
	if (config.path) {
		if (existsSync(config.path)) {
			return jiti(config.path);
		} else {
			throw new Error(`Config file does not exist: ${config.path}`);
		}
	} else {
		for (const configPath of DEFAULT_CONFIG_PATHS) {
			if (existsSync(configPath)) {
				const mod = jiti(configPath) as UserConfig | { default: UserConfig };

				return "default" in mod ? mod.default : mod;
			}
		}
	}

	// If no config file exists, an empty config is returned.
	return {};
};
