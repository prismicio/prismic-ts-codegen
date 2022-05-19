import type { SharedSliceModel } from "@prismicio/types";
import type {
	InterfaceDeclaration,
	SourceFile,
	TypeAliasDeclaration,
} from "ts-morph";

import { addInterfacePropertiesForFields } from "./addInterfacePropertiesForFields";
import { buildSharedSliceInterfaceName } from "./buildSharedSliceInterfaceName";
import { pascalCase } from "./pascalCase";
import { getHumanReadableFieldPath } from "./getHumanReadableFieldPath";
import { SHARED_SLICES_DOCUMENTATION_URL } from "../constants";
import { FieldConfigs } from "../types";

type AddTypeAliasForSharedSliceConfig = {
	model: SharedSliceModel;
	sourceFile: SourceFile;
	fieldConfigs: FieldConfigs;
};

export const addTypeAliasForSharedSlice = (
	config: AddTypeAliasForSharedSliceConfig,
): TypeAliasDeclaration => {
	const variationTypeNames: string[] = [];

	for (const variation of config.model.variations) {
		let primaryInterface: InterfaceDeclaration | undefined;
		if (Object.keys(variation.primary).length > 0) {
			primaryInterface = config.sourceFile.addInterface({
				name: pascalCase(
					`${buildSharedSliceInterfaceName({ id: config.model.id })} ${
						variation.id
					} Primary`,
				),
				docs: [
					{
						description: (writer) => {
							const humanReadablePath = getHumanReadableFieldPath({
								path: [
									{
										id: config.model.id,
										model: config.model,
									},
									{
										id: "primary",
										label: "Primary",
									},
								],
							});

							writer.writeLine(`Primary content in ${humanReadablePath}`);
						},
					},
				],
			});
			addInterfacePropertiesForFields({
				interface: primaryInterface,
				sourceFile: config.sourceFile,
				fields: variation.primary,
				path: [
					{
						id: config.model.id,
						model: config.model,
					},
					{
						id: "primary",
						label: "Primary",
					},
				],
				fieldConfigs: config.fieldConfigs,
			});
		}

		let itemInterface: InterfaceDeclaration | undefined;
		if (Object.keys(variation.items).length > 0) {
			itemInterface = config.sourceFile.addInterface({
				name: pascalCase(
					`${buildSharedSliceInterfaceName({ id: config.model.id })} ${
						variation.id
					} Item`,
				),
				docs: [
					{
						description: (writer) => {
							const humanReadablePath = getHumanReadableFieldPath({
								path: [
									{
										id: config.model.id,
										model: config.model,
									},
									{
										id: "items",
										label: "Items",
									},
								],
							});

							writer.writeLine(`Item in ${humanReadablePath}`);
						},
					},
				],
				isExported: true,
			});
			addInterfacePropertiesForFields({
				interface: itemInterface,
				sourceFile: config.sourceFile,
				fields: variation.items,
				path: [
					{
						id: config.model.id,
						model: config.model,
					},
					{
						id: "items",
						label: "Items",
					},
				],
				fieldConfigs: config.fieldConfigs,
			});
		}

		const variationType = config.sourceFile.addTypeAlias({
			name: pascalCase(
				`${buildSharedSliceInterfaceName({
					id: config.model.id,
				})} ${variation.id}`,
			),
			type: `prismicT.SharedSliceVariation<"${variation.id}", ${
				primaryInterface
					? `Simplify<${primaryInterface.getName()}>`
					: "Record<string, never>"
			}, ${itemInterface ? `Simplify<${itemInterface.getName()}>` : "never"}>`,
			docs: [
				{
					description: (writer) => {
						writer.writeLine(
							`${variation.name} variation for ${config.model.name} Slice`,
						);
						writer.blankLine();
						writer.writeLine(`- **API ID**: \`${variation.id}\``);
						writer.writeLine(`- **Description**: \`${variation.description}\``);
						writer.writeLine(
							`- **Documentation**: ${SHARED_SLICES_DOCUMENTATION_URL}`,
						);
					},
				},
			],
		});

		variationTypeNames.push(variationType.getName());
	}

	const variationsType = config.sourceFile.addTypeAlias({
		name: pascalCase(`${config.model.id} Slice Variation`),
		type:
			variationTypeNames.length > 0 ? variationTypeNames.join(" | ") : "never",
		docs: [
			{
				description: (writer) => {
					const humanReadablePath = getHumanReadableFieldPath({
						path: [
							{
								id: config.model.id,
								model: config.model,
							},
						],
					});

					writer.writeLine(`Slice variation for *${humanReadablePath}*`);
				},
			},
		],
		isExported: true,
	});

	return config.sourceFile.addTypeAlias({
		name: pascalCase(
			buildSharedSliceInterfaceName({
				id: config.model.id,
			}),
		),
		type: `prismicT.SharedSlice<"${
			config.model.id
		}", ${variationsType.getName()}>`,
		docs: [
			{
				description: (writer) => {
					writer.writeLine(`${config.model.name} Shared Slice`);
					writer.blankLine();
					writer.writeLine(`- **API ID**: \`${config.model.id}\``);
					writer.writeLine(
						`- **Description**: \`${config.model.description}\``,
					);
					writer.writeLine(
						`- **Documentation**: ${SHARED_SLICES_DOCUMENTATION_URL}`,
					);
				},
			},
		],
		isExported: true,
	});
};
