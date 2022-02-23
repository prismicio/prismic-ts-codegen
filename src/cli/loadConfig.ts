import _jiti from "jiti";
import { existsSync } from "fs";
import { resolve as resolvePath } from "path";

import type { Config } from "./types";

const jiti = _jiti(process.cwd());

const DEFAULT_CONFIG_PATHS = [
	"prismicCodegen.config.ts",
	"prismicCodegen.config.js",
];

type LoadConfigConfig = {
	path?: string;
};

export const loadConfig = (config: LoadConfigConfig): Config => {
	if (config.path) {
		if (existsSync(config.path)) {
			return jiti(config.path);
		} else {
			throw new Error(`Config file does not exist: ${config.path}`);
		}
	} else {
		for (const configPath of DEFAULT_CONFIG_PATHS) {
			if (existsSync(configPath)) {
				const mod = jiti(resolvePath(configPath)) as
					| Config
					| { default: Config };

				return "default" in mod ? mod.default : mod;
			}
		}
	}

	// If no config file exists, an empty config is returned.
	return {};
};
