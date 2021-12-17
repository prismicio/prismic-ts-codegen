import {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelLinkSelectType,
	CustomTypeModelSliceType,
} from "@prismicio/types";
import type {
	InterfaceDeclarationStructure,
	JSDocableNodeStructure,
	SourceFile,
	TypeAliasDeclaration,
} from "ts-morph";
import { buildSharedSliceInterfaceName } from "./lib/buildSharedSliceInterfaceName";

import { pascalCase } from "./lib/pascalCase";

type BuildFieldDocsConfig = {
	field: CustomTypeModelField;
};

const buildFieldDocs = (
	config: BuildFieldDocsConfig,
): NonNullable<JSDocableNodeStructure["docs"]> => {
	return [
		{
			description: (writer) => {
				if ("label" in config.field.config && config.field.config.label) {
					writer.writeLine(`Label: ${config.field.config.label}`);
				}

				if (
					"placeholder" in config.field.config &&
					config.field.config.placeholder
				) {
					writer.writeLine(`Placeholder: ${config.field.config.placeholder}`);
				}

				if ("catalog" in config.field.config) {
					writer.writeLine(`Catalog: ${config.field.config.catalog}`);
				}
			},
		},
	];
};

type DefinitionToDataInterfacePropertiesConfig = {
	customTypeModel: CustomTypeModel;
	fields: Record<string, CustomTypeModelField>;
	sourceFile: SourceFile;
};

const definitionToDataInterfaceProperties = (
	config: DefinitionToDataInterfacePropertiesConfig,
): NonNullable<InterfaceDeclarationStructure["properties"]> => {
	const properties: InterfaceDeclarationStructure["properties"] = [];

	for (const id in config.fields) {
		const field = config.fields[id];

		switch (field.type) {
			case "UID": {
				// UID fields are not included in Data.
				break;
			}

			case "Boolean": {
				properties.push({
					name: id,
					type: "prismicT.BooleanField",
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "Color": {
				properties.push({
					name: id,
					type: "prismicT.ColorField",
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "Date": {
				properties.push({
					name: id,
					type: "prismicT.DateField",
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "Embed": {
				properties.push({
					name: id,
					type: "prismicT.EmbedField",
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "GeoPoint": {
				properties.push({
					name: id,
					type: "prismicT.GeoPointField",
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "Image": {
				if (field.config.thumbnails.length > 0) {
					const thumbnailNames = field.config.thumbnails
						.map((thumbnail) => `"${thumbnail.name}"`)
						.join(" | ");

					properties.push({
						name: id,
						type: `prismicT.Image<${thumbnailNames}>`,
						docs: buildFieldDocs({ field }),
					});
				} else {
					properties.push({
						name: id,
						type: "prismicT.Image",
						docs: buildFieldDocs({ field }),
					});
				}

				break;
			}

			case "IntegrationFields": {
				properties.push({
					name: id,
					type: "prismicT.IntegrationFields",
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "Link": {
				field.config.select;

				switch (field.config.select) {
					case CustomTypeModelLinkSelectType.Document: {
						field.config.customtypes;

						properties.push({
							name: id,
							type:
								field.config.customtypes && field.config.customtypes.length > 0
									? `prismicT.RelationField<${field.config.customtypes
											.map((type) => `"${type}"`)
											.join(" | ")}>`
									: "prismicT.RelationField",
							docs: buildFieldDocs({ field }),
						});

						break;
					}

					case CustomTypeModelLinkSelectType.Media: {
						properties.push({
							name: id,
							type: "prismicT.LinkToMediaField",
							docs: buildFieldDocs({ field }),
						});

						break;
					}

					default: {
						properties.push({
							name: id,
							type: "prismicT.LinkField",
							docs: buildFieldDocs({ field }),
						});
					}
				}

				break;
			}

			case "Number": {
				properties.push({
					name: id,
					type: "prismicT.NumberField",
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "StructuredText": {
				const isTitleField =
					"single" in field.config &&
					field.config.single
						.split(",")
						.every((blockType) => /heading/.test(blockType));

				if (isTitleField) {
					properties.push({
						name: id,
						type: "prismicT.TitleField",
						docs: buildFieldDocs({ field }),
					});
				} else {
					properties.push({
						name: id,
						type: "prismicT.RichTextField",
						docs: buildFieldDocs({ field }),
					});
				}

				break;
			}

			case "Select": {
				const options = field.config.options
					.map((option) => `"${option}"`)
					.join(" | ");
				const hasDefault = Boolean(field.config.default_value);

				if (hasDefault) {
					properties.push({
						name: id,
						type: `prismicT.Select<${options}, "filled">`,
						docs: buildFieldDocs({ field }),
					});
				} else {
					properties.push({
						name: id,
						type: `prismicT.Select<${options}>`,
						docs: buildFieldDocs({ field }),
					});
				}

				break;
			}

			case "Text": {
				properties.push({
					name: id,
					type: "prismicT.KeyTextField",
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "Timestamp": {
				properties.push({
					name: id,
					type: "prismicT.TimestampField",
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "Group": {
				const itemInterface = config.sourceFile.addInterface({
					name: pascalCase(
						`${config.customTypeModel.id} Document Data ${id} Item`,
					),
					properties: definitionToDataInterfaceProperties({
						customTypeModel: config.customTypeModel,
						fields: field.config.fields,
						sourceFile: config.sourceFile,
					}),
				});

				properties.push({
					name: id,
					type: `prismicT.GroupField<${itemInterface.getName()}>`,
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			case "Slices": {
				const choiceInterfaceNames: string[] = [];

				for (const choiceId in field.config.choices) {
					const choice = field.config.choices[choiceId];

					if (choice.type === CustomTypeModelSliceType.SharedSlice) {
						choiceInterfaceNames.push(
							buildSharedSliceInterfaceName({ id: choiceId }),
						);
					} else if (choice.type === CustomTypeModelSliceType.Slice) {
						const primaryInterface = config.sourceFile.addInterface({
							name: pascalCase(
								`${config.customTypeModel.id} Document Data ${id} ${choiceId} Slice Primary`,
							),
							properties: definitionToDataInterfaceProperties({
								customTypeModel: config.customTypeModel,
								fields: choice["non-repeat"],
								sourceFile: config.sourceFile,
							}),
						});

						const itemInterface = config.sourceFile.addInterface({
							name: pascalCase(
								`${config.customTypeModel.id} Document Data ${id} ${choiceId} Slice Item`,
							),
							properties: definitionToDataInterfaceProperties({
								customTypeModel: config.customTypeModel,
								fields: choice.repeat,
								sourceFile: config.sourceFile,
							}),
						});

						const sliceType = config.sourceFile.addTypeAlias({
							name: pascalCase(
								`${config.customTypeModel.id} Document Data ${id} ${choiceId} Slice`,
							),
							type: `prismicT.Slice<"${choiceId}", ${primaryInterface.getName()}, ${itemInterface.getName()}>`,
						});

						choiceInterfaceNames.push(sliceType.getName());
					}
				}

				const slicesType = config.sourceFile.addTypeAlias({
					name: pascalCase(
						`${config.customTypeModel.id} Document Data ${id} Slice`,
					),
					type:
						choiceInterfaceNames.length > 0
							? choiceInterfaceNames.join(" | ")
							: "never",
				});

				properties.push({
					name: id,
					type: `prismicT.SliceZone<${slicesType.getName()}>`,
					docs: buildFieldDocs({ field }),
				});

				break;
			}

			default: {
				properties.push({
					name: id,
					type: "unknown",
					docs: buildFieldDocs({ field }),
				});
			}
		}
	}

	return properties;
};

type CustomTypeToTypeConfig = {
	model: CustomTypeModel;
	sourceFile: SourceFile;
};

export const addTypeAliasFromCustomType = (
	config: CustomTypeToTypeConfig,
): TypeAliasDeclaration => {
	const fields: Record<string, CustomTypeModelField> = Object.assign(
		{},
		...Object.values(config.model.json),
	);

	const dataInterface = config.sourceFile.addInterface({
		name: pascalCase(`${config.model.id} Document Data`),
		properties: definitionToDataInterfaceProperties({
			customTypeModel: config.model,
			fields,
			sourceFile: config.sourceFile,
		}),
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
		type: `PrismicDocument<${dataInterface.getName()}, "${
			config.model.id
		}", Lang>`,
		isExported: true,
	});
};
