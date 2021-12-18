import type { CustomTypeModel, SharedSliceModel } from "@prismicio/types";
import type { Project, SourceFile } from "ts-morph";

import { BLANK_LINE_IDENTIFIER, NON_EDITABLE_FILE_HEADER } from "./constants";
import { addTypeAliasForCustomType } from "./addTypeAliasForCustomType";
import { addTypeAliasForSharedSlice } from "./addTypeAliasForSharedSlice";

type CreateTypesFileConfig = {
	project: Project;
	customTypeModels: CustomTypeModel[];
	sharedSliceModels: SharedSliceModel[];
};

export const createTypesFile = (config: CreateTypesFileConfig): SourceFile => {
	const sourceFile = config.project.createSourceFile("types.d.ts");

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

	for (const model of config.customTypeModels) {
		addTypeAliasForCustomType({ model, sourceFile });
	}

	for (const model of config.sharedSliceModels) {
		addTypeAliasForSharedSlice({ model, sourceFile });
	}

	return sourceFile;
};
