import { stripIndent } from "common-tags";
import { existsSync, writeFileSync } from "fs";
import meow from "meow";
import { resolve as resolvePath } from "path";

import { detectTypesProvider, generateTypes } from "../index";

import { configSchema } from "./configSchema";
import { NON_EDITABLE_FILE_HEADER } from "./constants";
import { loadConfig } from "./loadConfig";
import { loadLocaleIDs } from "./loadLocaleIDs";
import { loadModels } from "./loadModels";

const cli = meow(
	`
	Usage:
	    prismic-ts-codegen [options...]
	    prismic-ts-codegen init [options...]

	Commands:
	    init [options]

	Options:
	    -c, --config <path>  Path to a prismic-ts-codegen configuration file.
	`,
	{
		importMeta: import.meta,
		flags: {
			config: {
				type: "string",
				shortFlag: "c",
				isRequired: false,
			},
		},
	},
);

const main = async () => {
	if (cli.input[0] === "init") {
		const configPath = cli.flags.config || "prismicCodegen.config.ts";

		if (existsSync(configPath)) {
			console.info(`\n${configPath} already exists.`);
		} else {
			let contents = "";

			if (existsSync("slicemachine.config.json") || existsSync("sm.json")) {
				contents = stripIndent`
					import type { Config } from "prismic-ts-codegen";

					const config: Config = {
					  output: "./types.generated.ts",
					  models: ["./customtypes/**/index.json", "./slices/**/model.json"],
					};

					export default config;
				`;
			} else {
				contents = stripIndent`
					import type { Config } from "prismic-ts-codegen";

					const config: Config = {
					  output: "./types.generated.ts",
					};

					export default config;
				`;
			}

			writeFileSync(configPath, contents);

			console.info(`\nCreated prismic-ts-codegen config file: ${configPath}`);
		}
	} else {
		const unvalidatedConfig = loadConfig({ path: cli.flags.config });

		const { value: config, error } = configSchema.validate(unvalidatedConfig);

		if (config && !error) {
			const { customTypeModels, sharedSliceModels } = await loadModels({
				localPaths: Array.isArray(config.models)
					? config.models
					: config.models?.files,
				repositoryName: config.repositoryName,
				customTypesAPIToken: config.customTypesAPIToken,
				fetchFromRepository:
					config.models &&
					"fetchFromRepository" in config.models &&
					config.models.fetchFromRepository,
			});

			const localeIDs = await loadLocaleIDs({
				localeIDs: Array.isArray(config.locales)
					? config.locales
					: config.locales?.ids,
				repositoryName: config.repositoryName,
				accessToken: config.accessToken,
				fetchFromRepository:
					config.locales &&
					"fetchFromRepository" in config.locales &&
					config.locales.fetchFromRepository,
			});

			const typesProvider =
				config.typesProvider || (await detectTypesProvider());

			const hasCustomTypeModels = customTypeModels.length > 0;

			if (
				config.clientIntegration?.includeCreateClientInterface &&
				!hasCustomTypeModels
			) {
				console.info(
					"[INFO]: prismic-ts-codegen was configured to automatically integrate with `@prismicio/client`, but the integration was not generated because no Custom Type models were found. Automatic integration requires at least one Custom Type model.",
				);
			}

			const types = generateTypes({
				customTypeModels,
				sharedSliceModels,
				localeIDs,
				fieldConfigs: config.fields,
				clientIntegration: {
					includeCreateClientInterface: hasCustomTypeModels
						? config.clientIntegration?.includeCreateClientInterface ?? true
						: false,
					includeContentNamespace:
						config.clientIntegration?.includeContentNamespace ?? true,
				},
				typesProvider,
			});

			const fileContents = `${NON_EDITABLE_FILE_HEADER}\n\n${types}`;

			if (config.output) {
				writeFileSync(resolvePath(config.output), fileContents);

				console.info(`\nGenerated types in: ${config.output}`);
			} else {
				process.stdout.write(types + "\n");
			}
		} else {
			if (error) {
				console.error(error.message);

				return;
			}
		}
	}
};

main().catch((error) => console.error(error));
