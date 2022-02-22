import { writeFileSync } from "fs";
import { resolve as resolvePath } from "path";
import meow from "meow";

import { generateTypes } from "../index";

import { configSchema } from "./configSchema";
import { loadLocaleIDs } from "./loadLocaleIDs";
import { loadModels } from "./loadModels";
import { loadUserConfig } from "./loadUserConfig";

const cli = meow(
	`
	Usage
	  $ prismic-ts-codegen

	Options
	  -c, --config <path>  Path to a prismic-ts-codegen configuration file.
	`,
	{
		importMeta: import.meta,
		flags: {
			config: {
				type: "string",
				alias: "c",
				isRequired: false,
			},
		},
	},
);

const main = async () => {
	const rawUserConfig = loadUserConfig({ path: cli.flags.config });

	const { value: userConfig, error } = configSchema.validate(rawUserConfig);

	if (userConfig) {
		const { customTypeModels, sharedSliceModels } = await loadModels({
			localPaths:
				userConfig.models && "files" in userConfig.models
					? userConfig.models.files
					: (userConfig.models as string[]),
			repositoryName: userConfig.repositoryName,
			customTypesAPIToken: userConfig.customTypesAPIToken,
			fetchFromRepository:
				userConfig.models &&
				"fetchFromRepository" in userConfig.models &&
				userConfig.models.fetchFromRepository,
		});

		const localeIDs = await loadLocaleIDs({
			localeIDs:
				userConfig.locales && "ids" in userConfig.locales
					? userConfig.locales.ids
					: (userConfig.locales as string[]),
			repositoryName: userConfig.repositoryName,
			accessToken: userConfig.accessToken,
			fetchFromRepository:
				userConfig.locales &&
				"fetchFromRepository" in userConfig.locales &&
				userConfig.locales.fetchFromRepository,
		});

		const types = generateTypes({
			customTypeModels,
			sharedSliceModels,
			localeIDs,
		});

		if (userConfig.output) {
			writeFileSync(resolvePath(userConfig.output), types);
		} else {
			process.stdout.write(types + "\n");
		}
	} else {
		if (error) {
			console.error(error.message);

			return;
		}
	}
};

main().catch((error) => console.error(error));
