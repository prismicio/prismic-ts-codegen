import { existsSync, writeFileSync } from "fs";
import { parseArgs } from "node:util";
import { resolve as resolvePath } from "path";

import packageJson from "../../package.json" with { type: "json" };
import { detectTypesProvider, generateTypes } from "../index";
import { dedent } from "../lib/dedent";
import { configSchema } from "./configSchema";
import { NON_EDITABLE_FILE_HEADER } from "./constants";
import { loadConfig } from "./loadConfig";
import { loadLocaleIDs } from "./loadLocaleIDs";
import { loadModels } from "./loadModels";

const HELP = dedent`
	${packageJson.description}

	Usage:
	    prismic-ts-codegen [options...]
	    prismic-ts-codegen init [options...]

	Commands:
	    init [options]

	Options:
	    -c, --config <path>  Path to a prismic-ts-codegen configuration file.
	    -h, --help           Show this help.
	    -v, --version        Show the version.
`;

const main = async () => {
	const {
		positionals: [command],
		values: { config: configFlag, help, version },
	} = parseArgs({
		options: {
			config: { type: "string", short: "c" },
			help: { type: "boolean", short: "h" },
			version: { type: "boolean", short: "v" },
		},
		allowPositionals: true,
		strict: false,
	});
	const configPathFlag = typeof configFlag === "string" ? configFlag : undefined;

	if (help) {
		console.info(`\n${HELP}\n`);
		return;
	}

	if (version) {
		console.info(packageJson.version);
		return;
	}

	if (command === "init") {
		const configPath = configPathFlag || "prismicCodegen.config.ts";

		if (existsSync(configPath)) {
			console.info(`\n${configPath} already exists.`);
		} else {
			let contents = "";

			if (existsSync("slicemachine.config.json") || existsSync("sm.json")) {
				contents = dedent`
					import type { Config } from "prismic-ts-codegen";

					const config: Config = {
					  output: "./types.generated.ts",
					  models: ["./customtypes/**/index.json", "./slices/**/model.json"],
					};

					export default config;
				`;
			} else {
				contents = dedent`
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
		const unvalidatedConfig = await loadConfig({ path: configPathFlag });

		const result = configSchema.safeParse(unvalidatedConfig);

		if (result.success) {
			const config = result.data;
			const { customTypeModels, sharedSliceModels } = await loadModels({
				localPaths: Array.isArray(config.models) ? config.models : config.models?.files,
				repositoryName: config.repositoryName,
				customTypesAPIToken: config.customTypesAPIToken,
				fetchFromRepository:
					config.models &&
					"fetchFromRepository" in config.models &&
					config.models.fetchFromRepository,
			});

			const localeIDs = await loadLocaleIDs({
				localeIDs: Array.isArray(config.locales) ? config.locales : config.locales?.ids,
				repositoryName: config.repositoryName,
				accessToken: config.accessToken,
				fetchFromRepository:
					config.locales &&
					"fetchFromRepository" in config.locales &&
					config.locales.fetchFromRepository,
			});

			const typesProvider = config.typesProvider || (await detectTypesProvider());

			const hasCustomTypeModels = customTypeModels.length > 0;

			if (config.clientIntegration?.includeCreateClientInterface && !hasCustomTypeModels) {
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
						? (config.clientIntegration?.includeCreateClientInterface ?? true)
						: false,
					includeContentNamespace: config.clientIntegration?.includeContentNamespace ?? true,
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
			console.error(result.error.message);
			process.exit(1);
		}
	}
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
