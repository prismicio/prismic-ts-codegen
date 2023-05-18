import type { CustomTypeModel, CustomTypeModelField } from "@prismicio/client";
import type {
	InterfaceDeclaration,
	SourceFile,
	TypeAliasDeclaration,
} from "ts-morph";

import { FieldConfigs } from "../types";

import { CUSTOM_TYPES_DOCUMENTATION_URL } from "../constants";

import { addInterfacePropertiesForFields } from "./addInterfacePropertiesForFields";
import { buildTypeName } from "./buildTypeName";

const collectCustomTypeFields = (
	model: CustomTypeModel,
): Record<string, CustomTypeModelField> => {
	return Object.assign({}, ...Object.values(model.json));
};

type AddTypeAliasForCustomTypeConfig = {
	model: CustomTypeModel;
	sourceFile: SourceFile;
	localeIDs: string[];
	fieldConfigs: FieldConfigs;
};

export const addTypeAliasForCustomType = ({
	model,
	sourceFile,
	localeIDs,
	fieldConfigs,
}: AddTypeAliasForCustomTypeConfig): TypeAliasDeclaration => {
	const { uid: uidField, ...fields } = collectCustomTypeFields(model);
	const hasDataFields = Object.keys(fields).length > 0;
	const hasUIDField = Boolean(uidField);

	let dataInterface: InterfaceDeclaration | TypeAliasDeclaration;
	if (hasDataFields) {
		dataInterface = sourceFile.addInterface({
			name: buildTypeName(model.id, "Document", "Data"),
			docs: [
				{
					description: `Content for ${model.label} documents`,
				},
			],
		});

		for (const tabName in model.json) {
			// This is destructured to ensure the UID field is
			// ignored.
			const { uid: _uidField, ...tabFields } = model.json[tabName];

			addInterfacePropertiesForFields({
				fields: tabFields,
				interface: dataInterface,
				sourceFile: sourceFile,
				path: [
					{
						id: model.id,
						model: model,
					},
				],
				fieldConfigs,
				tabName,
			});
		}
	} else {
		dataInterface = sourceFile.addTypeAlias({
			name: buildTypeName(model.id, "Document", "Data"),
			type: `Record<string, never>`,
			docs: [
				{
					description: `Content for ${model.label} documents`,
				},
			],
		});
	}

	return sourceFile.addTypeAlias({
		name: buildTypeName(model.id, "Document"),
		typeParameters: [
			{
				name: "Lang",
				constraint: "string",
				default:
					localeIDs.length > 0
						? localeIDs.map((localeID) => `"${localeID}"`).join(" | ")
						: "string",
			},
		],
		type: hasUIDField
			? `prismic.PrismicDocumentWithUID<Simplify<${dataInterface.getName()}>, "${
					model.id
			  }", Lang>`
			: `prismic.PrismicDocumentWithoutUID<Simplify<${dataInterface.getName()}>, "${
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
