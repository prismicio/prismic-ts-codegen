import type { CustomTypeModel, CustomTypeModelField } from "@prismicio/types";
import type { SourceFile, TypeAliasDeclaration } from "ts-morph";

import { addInterfacePropertiesForFields } from "./lib/addInterfacePropertiesForFields";
import { pascalCase } from "./lib/pascalCase";

type AddTypeAliasForCustomTypeConfig = {
	customTypeModel: CustomTypeModel;
	sourceFile: SourceFile;
};

export const addTypeAliasForCustomType = (
	config: AddTypeAliasForCustomTypeConfig,
): TypeAliasDeclaration => {
	const fields: Record<string, CustomTypeModelField> = Object.assign(
		{},
		...Object.values(config.customTypeModel.json),
	);

	const dataInterface = config.sourceFile.addInterface({
		name: pascalCase(`${config.customTypeModel.id} Document Data`),
	});
	addInterfacePropertiesForFields({
		fields,
		interface: dataInterface,
		sourceFile: config.sourceFile,
		rootModel: config.customTypeModel,
	});

	return config.sourceFile.addTypeAlias({
		name: pascalCase(`${config.customTypeModel.id} Document`),
		typeParameters: [
			{
				name: "Lang",
				constraint: "string",
				default: "string",
			},
		],
		type: `PrismicDocument<${dataInterface.getName()}, "${
			config.customTypeModel.id
		}", Lang>`,
		docs: [
			{
				description: `${config.customTypeModel.label} Prismic document (API ID: ${config.customTypeModel.id})`,
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
