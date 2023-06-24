import type {
	CustomTypeModel,
	CustomTypeModelField,
	SharedSliceModel,
} from "@prismicio/client";
import { source as typescript } from "common-tags";
import { ModuleDeclarationKind, Project } from "ts-morph";

import { addTypeAliasForCustomType } from "./lib/addTypeAliasForCustomType";
import { addTypeAliasForSharedSlice } from "./lib/addTypeAliasForSharedSlice";
import { buildSharedSliceInterfaceNamePart } from "./lib/buildSharedSliceInterfaceNamePart";
import { buildTypeName } from "./lib/buildTypeName";
import { getSourceFileText } from "./lib/getSourceFileText";

import { FieldConfigs } from "./types";

import { BLANK_LINE_IDENTIFIER } from "./constants";

export type TypesProvider = "@prismicio/client" | "@prismicio/types";

function collectCustomTypeFields(
	model: CustomTypeModel,
): Record<string, CustomTypeModelField> {
	return Object.assign({}, ...Object.values(model.json));
}

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
};

export function generateTypes(config: GenerateTypesConfig = {}): string {
	let result = "";

	const typesProvider = config.typesProvider || "@prismicio/types";
	let clientNamespaceImportName = "prismic";

	result += typescript`
		import type * as prismic from "${typesProvider}";
	`;

	if (
		config.clientIntegration?.includeCreateClientInterface ||
		config.clientIntegration?.includeContentNamespace
	) {
		if (typesProvider !== "@prismicio/client") {
			clientNamespaceImportName = "prismicClient";

			// This import declaration would be a duplicate if the types
			// provider is @prismicio/client.
			result += "\n";
			result += typescript`
				import type * as ${clientNamespaceImportName} from "@prismicio/client";
			`;
		}
	}

	result += "\n\n";
	result += typescript`
		type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };
	`;
	result += "\n\n";

	if (config.customTypeModels) {
		for (const model of config.customTypeModels) {
			const { uid: uidField, ...fields } = collectCustomTypeFields(model);
			const hasDataFields = Object.keys(fields).length > 0;
			const hasUIDField = Boolean(uidField);

			const typeName = buildTypeName(model.id, "Document");
			const dataTypeName = buildTypeName(typeName, "Data");
			const langDefault =
				config.localeIDs && config.localeIDs.length > 0
					? config.localeIDs.map((localeID) => `"${localeID}"`).join(" | ")
					: "string";
			const baseDocumentType = hasUIDField
				? "PrismicDocumentWithUID"
				: "PrismicDocumentWithoutUID";

			if (hasDataFields) {
				result += "\n\n";
				// TODO: Generate the real type
				result += typescript`
					interface ${dataTypeName} {}
				`;
			} else {
				result += "\n\n";
				result += typescript`
					type ${dataTypeName} = Record<string, never>
				`;
			}

			result += "\n\n";
			result += typescript`
				export type ${typeName}<Lang extends string = ${langDefault}> =
					prismic.${baseDocumentType}<
						Simplify<${dataTypeName}>,
						"${model.id}",
						Lang
					>;
			`;
		}

		if (config.customTypeModels.length > 0) {
			const allCustomTypesUnion = config.customTypeModels
				.map((customTypeModel) => buildTypeName(customTypeModel.id, "Document"))
				.join(" | ");

			result += "\n\n";
			result += typescript`
				export type AllDocumentTypes = ${allCustomTypesUnion};
			`;
		}
	}

	if (config.sharedSliceModels) {
		for (const model of config.sharedSliceModels) {
			const typeName = buildTypeName(
				buildSharedSliceInterfaceNamePart({ id: model.id }),
			);

			for (const variation of model.variations) {
				const typeName = buildTypeName(
					buildSharedSliceInterfaceNamePart({ id: model.id }),
					variation.id,
				);

				result += "\n\n";
				result += typescript`
					export type ${typeName} = prismic.SharedSliceVariation<
						"${variation.id}",
						Record<string, never>,
						never
					>;
				`;
			}

			const variationsTypeName = buildTypeName(
				buildSharedSliceInterfaceNamePart({ id: model.id }),
				"Variation",
			);
			const variationTypeNames = model.variations.map((variation) => {
				return buildTypeName(
					buildSharedSliceInterfaceNamePart({ id: model.id }),
					variation.id,
				);
			});

			result += "\n\n";
			result += typescript`
				type ${variationsTypeName} = ${
				variationTypeNames.length > 0 ? variationTypeNames.join(" | ") : "never"
			};
			`;

			result += "\n\n";
			result += typescript`
				export type ${typeName} = prismic.SharedSlice<
					"${model.id}",
					${variationsTypeName}
				>;
			`;
		}
	}

	if (
		config.clientIntegration?.includeCreateClientInterface ||
		config.clientIntegration?.includeContentNamespace
	) {
		result += typescript`
			declare module "@prismicio/client" {
		`;

		if (config.clientIntegration.includeCreateClientInterface) {
			result += `\n`;

			if ((config.customTypeModels?.length || 0) > 0) {
				result += typescript`
					interface CreateClient {
						(
							repositoryNameOrEndpoint: string,
							options?: ${clientNamespaceImportName}.ClientConfig
						): ${clientNamespaceImportName}.Client<AllDocumentTypes>;
					}
				`;
			} else {
				result += typescript`
					interface CreateClient {
						(
							repositoryNameOrEndpoint: string,
							options?: ${clientNamespaceImportName}.ClientConfig
						): ${clientNamespaceImportName}.Client;
					}
				`;
			}
		}

		if (config.clientIntegration.includeContentNamespace) {
			const customTypeTypeNames = (config.customTypeModels || []).flatMap(
				(model) => {
					const documentTypeName = buildTypeName(model.id, "Document");

					return [documentTypeName, buildTypeName(documentTypeName, "Data")];
				},
			);

			const sharedSliceTypeNames = (config.sharedSliceModels || []).flatMap(
				(model) => {
					return [
						...model.variations.map((variation) => {
							return buildTypeName(
								buildSharedSliceInterfaceNamePart({ id: model.id }),
								variation.id,
							);
						}),
						buildTypeName(
							buildSharedSliceInterfaceNamePart({ id: model.id }),
							"Variation",
						),
						buildTypeName(buildSharedSliceInterfaceNamePart({ id: model.id })),
					];
				},
			);

			result += `\n`;
			result += typescript`
				namespace Content {
					export type {
						${(config.customTypeModels?.length || 0) > 0 ? "AllDocumentTypes\n" : ""}
						${customTypeTypeNames.join(",\n")}
						${sharedSliceTypeNames.join(",\n")}
					}
				}
			`;
		}

		result += `\n`;
		result += typescript`
			}
		`;
	}

	return result;
}

export const _generateTypes = (config: GenerateTypesConfig = {}) => {
	const project = new Project({
		useInMemoryFileSystem: true,
	});

	const sourceFile = project.createSourceFile("types.d.ts");

	const typesProvider = config.typesProvider || "@prismicio/types";

	sourceFile.addImportDeclaration({
		moduleSpecifier: typesProvider,
		namespaceImport: "prismic",
		isTypeOnly: true,
	});

	sourceFile.addStatements(BLANK_LINE_IDENTIFIER);

	const simplifyTypeAlias = sourceFile.addTypeAlias({
		name: "Simplify",
		typeParameters: [
			{
				name: "T",
			},
		],
		type: `{ [KeyType in keyof T]: T[KeyType] }`,
	});

	if (config.customTypeModels) {
		for (const model of config.customTypeModels) {
			addTypeAliasForCustomType({
				model,
				sourceFile,
				localeIDs: config.localeIDs || [],
				fieldConfigs: config.fieldConfigs || {},
			});
		}

		if (config.customTypeModels.length > 0) {
			sourceFile.addTypeAlias({
				name: "AllDocumentTypes",
				type: config.customTypeModels
					.map((customTypeModel) =>
						buildTypeName(customTypeModel.id, "Document"),
					)
					.join(" | "),
				isExported: true,
			});
		}
	}

	if (config.sharedSliceModels) {
		for (const model of config.sharedSliceModels) {
			addTypeAliasForSharedSlice({
				model,
				sourceFile,
				fieldConfigs: config.fieldConfigs || {},
			});
		}
	}

	if (
		config.clientIntegration?.includeCreateClientInterface ||
		config.clientIntegration?.includeContentNamespace
	) {
		let clientNamespaceImportName = "prismic";

		if (typesProvider !== "@prismicio/client") {
			clientNamespaceImportName = "prismicClient";

			// This import declaration would be a duplicate if the types
			// provider is @prismicio/client.
			sourceFile.addImportDeclaration({
				moduleSpecifier: "@prismicio/client",
				namespaceImport: clientNamespaceImportName,
				isTypeOnly: true,
			});
		}

		const clientModuleDeclaration = sourceFile.addModule({
			name: '"@prismicio/client"',
			hasDeclareKeyword: true,
			declarationKind: ModuleDeclarationKind.Module,
		});

		if (config.clientIntegration.includeCreateClientInterface) {
			clientModuleDeclaration.addInterface({
				name: "CreateClient",
				callSignatures: [
					{
						parameters: [
							{
								name: "repositoryNameOrEndpoint",
								type: "string",
							},
							{
								name: "options",
								type: `${clientNamespaceImportName}.ClientConfig`,
								hasQuestionToken: true,
							},
						],
						returnType:
							(config.customTypeModels?.length || 0) > 0
								? `${clientNamespaceImportName}.Client<AllDocumentTypes>`
								: `${clientNamespaceImportName}.Client`,
					},
				],
			});
		}

		if (config.clientIntegration.includeContentNamespace) {
			const contentNamespaceDeclaration = clientModuleDeclaration.addModule({
				name: "Content",
				declarationKind: ModuleDeclarationKind.Namespace,
			});

			const exportSymbols = sourceFile
				.getExportSymbols()
				.filter((exportSymbol) => {
					// The Simplify utility type should not
					// be exported, but it is included in
					// `getExportSymbols()`'s result.
					return exportSymbol.getName() !== simplifyTypeAlias.getName();
				});

			contentNamespaceDeclaration.addExportDeclaration({
				isTypeOnly: true,
				namedExports: exportSymbols.map((exportSymbol) => {
					return {
						name: exportSymbol.getName(),
					};
				}),
			});
		}
	}

	return getSourceFileText(sourceFile);
};
