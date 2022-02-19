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
	langIDs?: string[];
};

export const addTypeAliasForCustomType = ({
	model,
	sourceFile,
	langIDs = [],
}: AddTypeAliasForCustomTypeConfig): TypeAliasDeclaration => {
	const { uid: uidField, ...fields } = collectCustomTypeFields(model);
	const hasDataFields = Object.keys(fields).length > 0;
	const hasUIDField = Boolean(uidField);

	let dataInterface: InterfaceDeclaration | TypeAliasDeclaration;
	if (hasDataFields) {
		dataInterface = sourceFile.addInterface({
			name: pascalCase(`${model.id} Document Data`),
			docs: [
				{
					description: `Content for ${model.label} documents`,
				},
			],
		});
		addInterfacePropertiesForFields({
			fields,
			interface: dataInterface,
			sourceFile: sourceFile,
			path: [
				{
					id: model.id,
					model: model,
				},
			],
		});
	} else {
		dataInterface = sourceFile.addTypeAlias({
			name: pascalCase(`${model.id} Document Data`),
			type: `Record<string, never>`,
			docs: [
				{
					description: `Content for ${model.label} documents`,
				},
			],
		});
	}

	return sourceFile.addTypeAlias({
		name: pascalCase(`${model.id} Document`),
		typeParameters: [
			{
				name: "Lang",
				constraint: "string",
				default:
					langIDs.length > 0
						? langIDs.map((langID) => `"${langID}"`).join(" | ")
						: "string",
			},
		],
		type: hasUIDField
			? `prismicT.PrismicDocumentWithUID<${dataInterface.getName()}, "${
					model.id
			  }", Lang>`
			: `prismicT.PrismicDocumentWithoutUID<${dataInterface.getName()}, "${
					model.id
			  }", Lang>`,
		docs: [
			{
				description: (writer) => {
					writer.writeLine(`${model.label} document from Prismic`);
					writer.blankLine();
					writer.writeLine(`- **API ID**: \`${model.id}\``);
					writer.writeLine(`- **Repeatable**: \`${model.repeatable}\``);
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
