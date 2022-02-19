import { Project } from "ts-morph";
import type { CustomTypeModel, SharedSliceModel } from "@prismicio/types";

import { BLANK_LINE_IDENTIFIER, NON_EDITABLE_FILE_HEADER } from "./constants";
import { addTypeAliasForCustomType } from "./lib/addTypeAliasForCustomType";
import { addTypeAliasForSharedSlice } from "./lib/addTypeAliasForSharedSlice";
import { getSourceFileText } from "./lib/getSourceFileText";

export type GenerateTypesConfig = {
	customTypeModels?: CustomTypeModel[];
	sharedSliceModels?: SharedSliceModel[];
	langIDs?: string[];
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
				langIDs: config.langIDs,
			});
		}
	}

	if (config.sharedSliceModels) {
		for (const model of config.sharedSliceModels) {
			addTypeAliasForSharedSlice({
				model,
				sourceFile,
			});
		}
	}

	return getSourceFileText(sourceFile);
};
