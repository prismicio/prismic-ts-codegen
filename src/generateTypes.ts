import type { CustomTypeModel, SharedSliceModel } from "@prismicio/client";
import { source } from "common-tags";
import QuickLRU from "quick-lru";

import { addLine } from "./lib/addLine";
import { addSection } from "./lib/addSection";
import { buildCustomTypeType } from "./lib/buildCustomTypeType";
import { buildSharedSliceType } from "./lib/buildSharedSliceType";
import { buildUnion } from "./lib/buildUnion";

import { FieldConfigs } from "./types";

export type TypesProvider = "@prismicio/client" | "@prismicio/types";

const cache = new QuickLRU<string, unknown>({ maxSize: 1000 });

export type GenerateTypesConfig = {
	customTypeModels?: CustomTypeModel[];
	sharedSliceModels?: SharedSliceModel[];
	localeIDs?: string[];
	fieldConfigs?: FieldConfigs;
	typesProvider?: TypesProvider;
	clientIntegration?: {
		includeCreateClientInterface?: boolean;
		includeContentNamespace?: boolean;
	};
	cache?: boolean;
};

export function generateTypes(config: GenerateTypesConfig = {}): string {
	const fieldConfigs = config.fieldConfigs || {};
	const shouldUseCache = config.cache ?? true;

	let code = "";

	const typesProvider = config.typesProvider || "@prismicio/types";
	let clientImportName = "prismic";

	code = addLine(`import type * as prismic from "${typesProvider}";`, code);

	if (
		config.clientIntegration?.includeCreateClientInterface ||
		config.clientIntegration?.includeContentNamespace
	) {
		if (typesProvider !== "@prismicio/client") {
			clientImportName = "prismicClient";

			// This import declaration would be a duplicate if the types
			// provider is @prismicio/client.
			code = addLine(
				`import type * as ${clientImportName} from "@prismicio/client";`,
				code,
			);
		}
	}

	code = addSection(
		`type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };`,
		code,
	);

	const contentTypeNames: string[] = [];

	if (config.customTypeModels) {
		const allDocumentTypesTypeNames: string[] = [];

		for (const model of config.customTypeModels) {
			const customTypeType = buildCustomTypeType({
				model,
				localeIDs: config.localeIDs,
				fieldConfigs,
				cache: shouldUseCache ? cache : undefined,
			});

			for (const auxiliaryType of customTypeType.auxiliaryTypes) {
				code = addSection(auxiliaryType.code, code);
			}

			code = addSection(customTypeType.code, code);

			allDocumentTypesTypeNames.push(customTypeType.name);

			contentTypeNames.push(customTypeType.name);
			contentTypeNames.push(...customTypeType.contentTypeNames);
		}

		if (config.customTypeModels.length > 0) {
			const allDocumentTypesUnionName = "AllDocumentTypes";
			const allDocumentTypesUnion = buildUnion(allDocumentTypesTypeNames);

			code = addSection(
				`export type ${allDocumentTypesUnionName} = ${allDocumentTypesUnion};`,
				code,
			);

			contentTypeNames.push(allDocumentTypesUnionName);
		}
	}

	if (config.sharedSliceModels) {
		for (const model of config.sharedSliceModels) {
			const sharedSliceType = buildSharedSliceType({
				model,
				fieldConfigs,
				cache: shouldUseCache ? cache : undefined,
			});

			code = addSection(sharedSliceType.code, code);

			contentTypeNames.push(sharedSliceType.name);
			contentTypeNames.push(...sharedSliceType.contentTypeNames);
		}
	}

	if (
		config.clientIntegration?.includeCreateClientInterface ||
		config.clientIntegration?.includeContentNamespace
	) {
		let clientModuleCode = "";

		if (config.clientIntegration.includeCreateClientInterface) {
			if ((config.customTypeModels?.length || 0) > 0) {
				clientModuleCode = addSection(
					`interface CreateClient {
	(repositoryNameOrEndpoint: string, options?: ${clientImportName}.ClientConfig): ${clientImportName}.Client<AllDocumentTypes>;
}`,
					clientModuleCode,
				);
			} else {
				clientModuleCode = addSection(
					`interface CreateClient {
	(repositoryNameOrEndpoint: string, options?: ${clientImportName}.ClientConfig): ${clientImportName}.Client;
}`,
					clientModuleCode,
				);
			}
		}

		if (config.clientIntegration.includeContentNamespace) {
			clientModuleCode = addSection(
				source`
					namespace Content {
						export type {
							${contentTypeNames.join(",\n")}
						}
					}
				`,
				clientModuleCode,
			);
		}

		code = addSection(
			source`
				declare module "@prismicio/client" {
					${clientModuleCode}
				}
			`,
			code,
		);
	}

	return code;
}
