import type { CustomTypeModel, CustomTypeModelField } from "@prismicio/types";
import type { SourceFile, TypeAliasDeclaration } from "ts-morph";

import { addInterfacePropertiesForFields } from "./lib/addInterfacePropertiesForFields";
import { pascalCase } from "./lib/pascalCase";

const collectCustomTypeFields = (
	model: CustomTypeModel,
): Record<string, CustomTypeModelField> => {
	return Object.assign({}, ...Object.values(model.json));
};

type AddTypeAliasForCustomTypeConfig = {
	model: CustomTypeModel;
	sourceFile: SourceFile;
};

export const addTypeAliasForCustomType = (
	config: AddTypeAliasForCustomTypeConfig,
): TypeAliasDeclaration => {
	const fields = collectCustomTypeFields(config.model);
	const hasUIDField = "uid" in fields;

	const dataInterface = config.sourceFile.addInterface({
		name: pascalCase(`${config.model.id} Document Data`),
	});
	addInterfacePropertiesForFields({
		fields,
		interface: dataInterface,
		sourceFile: config.sourceFile,
		rootModel: config.model,
	});

	return config.sourceFile.addTypeAlias({
		name: pascalCase(`${config.model.id} Document`),
		typeParameters: [
			{
				name: "Lang",
				constraint: "string",
				default: "string",
			},
		],
		type: hasUIDField
			? `prismicT.PrismicDocumentWithUID<${dataInterface.getName()}, "${
					config.model.id
			  }", Lang>`
			: `prismicT.PrismicDocumentWithoutUID<${dataInterface.getName()}, "${
					config.model.id
			  }", Lang>`,
		docs: [
			{
				description: `${config.model.label} Prismic document (API ID: \`${config.model.id}\`)`,
				tags: [
					{
						tagName: "typeParam",
						text: "Lang - Language API ID of the document.",
					},
				],
			},
		],
		isExported: true,
	});
};
