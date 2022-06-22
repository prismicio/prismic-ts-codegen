import { Project, ModuleDeclarationKind } from "ts-morph";
import type { CustomTypeModel, SharedSliceModel } from "@prismicio/types";

import { BLANK_LINE_IDENTIFIER, NON_EDITABLE_FILE_HEADER } from "./constants";
import { addTypeAliasForCustomType } from "./lib/addTypeAliasForCustomType";
import { addTypeAliasForSharedSlice } from "./lib/addTypeAliasForSharedSlice";
import { getSourceFileText } from "./lib/getSourceFileText";
import { FieldConfigs } from "./types";
import { pascalCase } from "./lib/pascalCase";
import { addCreateClientCallSignature } from "./lib/addCreateClientCallSignature";

export type GenerateTypesConfig = {
	customTypeModels?: CustomTypeModel[];
	sharedSliceModels?: SharedSliceModel[];
	localeIDs?: string[];
	fieldConfigs?: FieldConfigs;
	clientIntegration?: {
		includeCreateClientInterface?: boolean;
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

	sourceFile.addTypeAlias({
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

		// TODO: Test that AllDocumentTypes is created and exported
		sourceFile.addTypeAlias({
			name: "AllDocumentTypes",
			type: config.customTypeModels
				.map((customTypeModel) => pascalCase(`${customTypeModel.id} Document`))
				.join(" | "),
			isExported: true,
		});
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

	if (config.clientIntegration?.includeCreateClientInterface) {
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

	return getSourceFileText(sourceFile);
};
