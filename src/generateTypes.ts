import type { CustomTypeModel, SharedSliceModel } from "@prismicio/client";
import { ModuleDeclarationKind, Project } from "ts-morph";

import { addTypeAliasForCustomType } from "./lib/addTypeAliasForCustomType";
import { addTypeAliasForSharedSlice } from "./lib/addTypeAliasForSharedSlice";
import { buildTypeName } from "./lib/buildTypeName";
import { getSourceFileText } from "./lib/getSourceFileText";

import { FieldConfigs } from "./types";

import { BLANK_LINE_IDENTIFIER } from "./constants";

export type TypesProvider = "@prismicio/client" | "@prismicio/types";

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

export const generateTypes = (config: GenerateTypesConfig = {}) => {
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
			const allModelIds: string[] = [];
			const modelIdsWithUID: string[] = [];
			const modelIdsWithoutUID: string[] = [];
			config.customTypeModels.forEach((model) => {
				const modelIdString = `"${model.id}"`;
				allModelIds.push(modelIdString);
				if (Object.assign({}, ...Object.values(model.json)).uid) {
					modelIdsWithUID.push(modelIdString);
				} else {
					modelIdsWithoutUID.push(modelIdString);
				}
			});

			const typeGuard = sourceFile.addFunction({
				name: "isTypeCode",
				returnType: "typeCode is AllDocumentTypes['type']",
				isExported: true,
				parameters: [
					{
						name: "typeCode",
						type: "string",
					},
				],
			});
			typeGuard.setBodyText((writer) => {
				writer.writeLine(
					`return [${allModelIds.join(", ")}].includes(typeCode);`,
				);
			});
			const typeGuardWithoutUIDs = sourceFile.addFunction({
				name: "isTypeCodeForTypeWithoutUIDs",
				returnType: "typeCode is AnyOurDocumentWithoutUID['type']",
				isExported: true,
				parameters: [
					{
						name: "typeCode",
						type: "string",
					},
				],
			});
			typeGuardWithoutUIDs.setBodyText((writer) => {
				writer.writeLine(
					`return [${modelIdsWithoutUID.join(", ")}].includes(typeCode);`,
				);
			});
			const typeGuardWithUIDs = sourceFile.addFunction({
				name: "isTypeCodeForTypeWithUIDs",
				returnType: "typeCode is AnyOurDocumentWithUID['type']",
				isExported: true,
				parameters: [
					{
						name: "typeCode",
						type: "string",
					},
				],
			});
			typeGuardWithUIDs.setBodyText((writer) => {
				writer.writeLine(
					`return [${modelIdsWithUID.join(", ")}].includes(typeCode);`,
				);
			});

			sourceFile.addTypeAlias({
				name: "AllDocumentTypes",
				type: config.customTypeModels
					.map((customTypeModel) =>
						buildTypeName(customTypeModel.id, "Document"),
					)
					.join(" | "),
				isExported: true,
			});

			sourceFile.addTypeAlias({
				name: "OnlyDocumentsWithUID",
				typeParameters: [{ name: "DocumentTypeWithOrWithoutUID" }],
				type: "DocumentTypeWithOrWithoutUID extends prismicT.PrismicDocumentWithUID ? DocumentTypeWithOrWithoutUID: never",
			});
			sourceFile.addTypeAlias({
				name: "AnyOurDocumentWithUID",
				type: "OnlyDocumentsWithUID<AllDocumentTypes>",
				isExported: true,
			});
			sourceFile.addTypeAlias({
				name: "OnlyDocumentsWithoutUID",
				typeParameters: [{ name: "DocumentTypeWithOrWithoutUID" }],
				type: "DocumentTypeWithOrWithoutUID extends prismicT.PrismicDocumentWithoutUID ? DocumentTypeWithOrWithoutUID: never",
			});
			sourceFile.addTypeAlias({
				name: "AnyOurDocumentWithoutUID",
				type: "OnlyDocumentsWithoutUID<AllDocumentTypes>",
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
					return (
						exportSymbol.getName() !== simplifyTypeAlias.getName() &&
						exportSymbol.getName() !== "isTypeCode" &&
						exportSymbol.getName() !== "isTypeCodeForTypeWithoutUIDs" &&
						exportSymbol.getName() !== "isTypeCodeForTypeWithUIDs"
					);
				});

			contentNamespaceDeclaration.addExportDeclaration({
				isTypeOnly: true,
				namedExports: exportSymbols.map((exportSymbol) => {
					return {
						name: exportSymbol.getName(),
					};
				}),
			});

			contentNamespaceDeclaration.addExportDeclaration({
				namedExports: [
					{ name: "isTypeCode" },
					{ name: "isTypeCodeForTypeWithoutUIDs" },
					{ name: "isTypeCodeForTypeWithUIDs" },
				],
			});
		}
	}

	return getSourceFileText(sourceFile);
};
