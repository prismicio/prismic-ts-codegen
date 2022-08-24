import { Project, ModuleDeclarationKind, TypeAliasDeclaration } from "ts-morph";
import type { CustomTypeModel, SharedSliceModel } from "@prismicio/types";

import { BLANK_LINE_IDENTIFIER, NON_EDITABLE_FILE_HEADER } from "./constants";
import { addTypeAliasForCustomType } from "./lib/addTypeAliasForCustomType";
import { addTypeAliasForSharedSlice } from "./lib/addTypeAliasForSharedSlice";
import { getSourceFileText } from "./lib/getSourceFileText";
import { FieldConfigs } from "./types";
import { pascalCase } from "./lib/pascalCase";

export type GenerateTypesConfig = {
	customTypeModels?: CustomTypeModel[];
	sharedSliceModels?: SharedSliceModel[];
	localeIDs?: string[];
	fieldConfigs?: FieldConfigs;
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

	sourceFile.addImportDeclaration({
		moduleSpecifier: "@prismicio/types",
		namespaceImport: "prismicT",
		isTypeOnly: true,
		leadingTrivia: NON_EDITABLE_FILE_HEADER,
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

	const customTypeTypeAliases: TypeAliasDeclaration[] = [];
	const sharedSliceTypeAliases: TypeAliasDeclaration[] = [];

	if (config.customTypeModels) {
		for (const model of config.customTypeModels) {
			const typeAlias = addTypeAliasForCustomType({
				model,
				sourceFile,
				localeIDs: config.localeIDs || [],
				fieldConfigs: config.fieldConfigs || {},
			});

			customTypeTypeAliases.push(typeAlias);
		}

		if (config.customTypeModels.length > 0) {
			const typeAlias = sourceFile.addTypeAlias({
				name: "AllDocumentTypes",
				type: config.customTypeModels
					.map((customTypeModel) =>
						pascalCase(`${customTypeModel.id} Document`),
					)
					.join(" | "),
				isExported: true,
			});

			customTypeTypeAliases.push(typeAlias);
		}
	}

	if (config.sharedSliceModels) {
		for (const model of config.sharedSliceModels) {
			const typeAlias = addTypeAliasForSharedSlice({
				model,
				sourceFile,
				fieldConfigs: config.fieldConfigs || {},
			});

			sharedSliceTypeAliases.push(typeAlias);
		}
	}

	if (
		config.clientIntegration?.includeCreateClientInterface ||
		config.clientIntegration?.includeContentNamespace
	) {
		sourceFile.addImportDeclaration({
			moduleSpecifier: "@prismicio/client",
			namespaceImport: "prismic",
			isTypeOnly: true,
		});

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
								type: "prismic.ClientConfig",
								hasQuestionToken: true,
							},
						],
						returnType:
							(config.customTypeModels?.length || 0) > 0
								? "prismic.Client<AllDocumentTypes>"
								: "prismic.Client",
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
