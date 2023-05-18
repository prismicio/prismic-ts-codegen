import { existsSync } from "fs";
import _jiti from "jiti";
import { resolve as resolvePath } from "path";

import type { Config } from "./types";

const jiti = _jiti(process.cwd());

const loadModuleWithJiti = <TModule>(id: string): TModule => {
	const mod = jiti(id) as TModule | { default: TModule };

	return typeof mod === "object" && mod !== null && "default" in mod
		? mod.default
		: mod;
};

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
			return loadModuleWithJiti(resolvePath(config.path));
		} else {
			throw new Error(`Config file does not exist: ${config.path}`);
		}
	} else {
		for (const configPath of DEFAULT_CONFIG_PATHS) {
			if (existsSync(configPath)) {
				return loadModuleWithJiti(resolvePath(configPath));
			}
		}
	}

	// If no config file exists, an empty config is returned.
	return {};
};
