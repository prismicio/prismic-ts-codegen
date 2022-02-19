import type { CustomTypeModel, CustomTypeModelField } from "@prismicio/types";
import type {
	SourceFile,
	TypeAliasDeclaration,
	InterfaceDeclaration,
} from "ts-morph";
import { CUSTOM_TYPES_DOCUMENTATION_URL } from "../constants";

import { addInterfacePropertiesForFields } from "./addInterfacePropertiesForFields";
import { pascalCase } from "./pascalCase";

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
	const { uid: uidField, ...fields } = collectCustomTypeFields(config.model);
	const hasDataFields = Object.keys(fields).length > 0;
	const hasUIDField = Boolean(uidField);

	let dataInterface: InterfaceDeclaration | TypeAliasDeclaration;
	if (hasDataFields) {
		dataInterface = config.sourceFile.addInterface({
			name: pascalCase(`${config.model.id} Document Data`),
			docs: [
				{
					description: `Content for ${config.model.label} documents`,
				},
			],
		});
		addInterfacePropertiesForFields({
			fields,
			interface: dataInterface,
			sourceFile: config.sourceFile,
			path: [
				{
					id: config.model.id,
					model: config.model,
				},
			],
		});
	} else {
		dataInterface = config.sourceFile.addTypeAlias({
			name: pascalCase(`${config.model.id} Document Data`),
			type: `Record<string, never>`,
			docs: [
				{
					description: `Content for ${config.model.label} documents`,
				},
			],
		});
	}

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
				description: (writer) => {
					writer.writeLine(`${config.model.label} document from Prismic`);
					writer.blankLine();
					writer.writeLine(`- **API ID**: \`${config.model.id}\``);
					writer.writeLine(`- **Repeatable**: \`${config.model.repeatable}\``);
					writer.writeLine(
						`- **Documentation**: ${CUSTOM_TYPES_DOCUMENTATION_URL}`,
					);
				},
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
