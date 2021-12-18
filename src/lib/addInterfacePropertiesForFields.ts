import type {
	CustomTypeModel,
	CustomTypeModelField,
	SharedSliceModel,
} from "@prismicio/types";
import {
	CustomTypeModelSliceType,
	CustomTypeModelLinkSelectType,
} from "@prismicio/types";
import type {
	InterfaceDeclaration,
	JSDocableNodeStructure,
	SourceFile,
} from "ts-morph";

import { buildSharedSliceInterfaceName } from "./buildSharedSliceInterfaceName";
import { pascalCase } from "./pascalCase";

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
					writer.write(`${config.field.config.label} field`);
				}

				writer.spaceIfLastNot();
				writer.write(`(type: ${config.field.type})`);
				writer.writeLine("");

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

type AddInterfacePropertyFromFieldConfig = {
	name: string;
	field: CustomTypeModelField;
	interface: InterfaceDeclaration;
	sourceFile: SourceFile;
	rootModel: CustomTypeModel | SharedSliceModel;
};

const addInterfacePropertyFromField = (
	config: AddInterfacePropertyFromFieldConfig,
) => {
	switch (config.field.type) {
		case "UID": {
			// UID fields are not included in Data.
			break;
		}

		case "Boolean": {
			config.interface.addProperty({
				name: config.name,
				type: "prismicT.BooleanField",
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "Color": {
			config.interface.addProperty({
				name: config.name,
				type: "prismicT.ColorField",
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "Date": {
			config.interface.addProperty({
				name: config.name,
				type: "prismicT.DateField",
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "Embed": {
			config.interface.addProperty({
				name: config.name,
				type: "prismicT.EmbedField",
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "GeoPoint": {
			config.interface.addProperty({
				name: config.name,
				type: "prismicT.GeoPointField",
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "Image": {
			if (config.field.config.thumbnails.length > 0) {
				const thumbnailNames = config.field.config.thumbnails
					.map((thumbnail) => `"${thumbnail.name}"`)
					.join(" | ");

				config.interface.addProperty({
					name: config.name,
					type: `prismicT.ImageField<${thumbnailNames}>`,
					docs: buildFieldDocs({ field: config.field }),
				});
			} else {
				config.interface.addProperty({
					name: config.name,
					type: "prismicT.ImageField",
					docs: buildFieldDocs({ field: config.field }),
				});
			}

			break;
		}

		case "IntegrationFields": {
			config.interface.addProperty({
				name: config.name,
				type: "prismicT.IntegrationFields",
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "Link": {
			switch (config.field.config.select) {
				case CustomTypeModelLinkSelectType.Document: {
					config.interface.addProperty({
						name: config.name,
						type:
							config.field.config.customtypes &&
							config.field.config.customtypes.length > 0
								? `prismicT.RelationField<${config.field.config.customtypes
										.map((type) => `"${type}"`)
										.join(" | ")}>`
								: "prismicT.RelationField",
						docs: buildFieldDocs({ field: config.field }),
					});

					break;
				}

				case CustomTypeModelLinkSelectType.Media: {
					config.interface.addProperty({
						name: config.name,
						type: "prismicT.LinkToMediaField",
						docs: buildFieldDocs({ field: config.field }),
					});

					break;
				}

				default: {
					config.interface.addProperty({
						name: config.name,
						type: "prismicT.LinkField",
						docs: buildFieldDocs({ field: config.field }),
					});
				}
			}

			break;
		}

		case "Number": {
			config.interface.addProperty({
				name: config.name,
				type: "prismicT.NumberField",
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "StructuredText": {
			const isTitleField =
				"single" in config.field.config &&
				config.field.config.single
					.split(",")
					.every((blockType) => /heading/.test(blockType));

			if (isTitleField) {
				config.interface.addProperty({
					name: config.name,
					type: "prismicT.TitleField",
					docs: buildFieldDocs({ field: config.field }),
				});
			} else {
				config.interface.addProperty({
					name: config.name,
					type: "prismicT.RichTextField",
					docs: buildFieldDocs({ field: config.field }),
				});
			}

			break;
		}

		case "Select": {
			const options = config.field.config.options
				.map((option) => `"${option}"`)
				.join(" | ");
			const hasDefault = Boolean(config.field.config.default_value);

			if (hasDefault) {
				config.interface.addProperty({
					name: config.name,
					type: `prismicT.SelectField<${options}, "filled">`,
					docs: buildFieldDocs({ field: config.field }),
				});
			} else {
				config.interface.addProperty({
					name: config.name,
					type: `prismicT.SelectField<${options}>`,
					docs: buildFieldDocs({ field: config.field }),
				});
			}

			break;
		}

		case "Text": {
			config.interface.addProperty({
				name: config.name,
				type: "prismicT.KeyTextField",
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "Timestamp": {
			config.interface.addProperty({
				name: config.name,
				type: "prismicT.TimestampField",
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "Group": {
			const itemInterface = config.sourceFile.addInterface({
				name: pascalCase(
					`${config.rootModel.id} Document Data ${config.name} Item`,
				),
			});
			addInterfacePropertiesForFields({
				interface: itemInterface,
				sourceFile: config.sourceFile,
				fields: config.field.config.fields,
				rootModel: config.rootModel,
			});

			config.interface.addProperty({
				name: config.name,
				type: `prismicT.GroupField<Simplify<${itemInterface.getName()}>>`,
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		case "Slices": {
			const choiceInterfaceNames: string[] = [];

			for (const choiceId in config.field.config.choices) {
				const choice = config.field.config.choices[choiceId];

				if (choice.type === CustomTypeModelSliceType.SharedSlice) {
					choiceInterfaceNames.push(
						buildSharedSliceInterfaceName({ id: choiceId }),
					);
				} else if (choice.type === CustomTypeModelSliceType.Slice) {
					let primaryInterface: InterfaceDeclaration | undefined;
					if (Object.keys(choice["non-repeat"]).length > 0) {
						primaryInterface = config.sourceFile.addInterface({
							name: pascalCase(
								`${config.rootModel.id} Document Data ${config.name} ${choiceId} Slice Primary`,
							),
						});
						addInterfacePropertiesForFields({
							interface: primaryInterface,
							sourceFile: config.sourceFile,
							fields: choice["non-repeat"],
							rootModel: config.rootModel,
						});
					}

					let itemInterface: InterfaceDeclaration | undefined;
					if (Object.keys(choice.repeat).length > 0) {
						const itemInterface = config.sourceFile.addInterface({
							name: pascalCase(
								`${config.rootModel.id} Document Data ${config.name} ${choiceId} Slice Item`,
							),
						});
						addInterfacePropertiesForFields({
							interface: itemInterface,
							sourceFile: config.sourceFile,
							fields: choice.repeat,
							rootModel: config.rootModel,
						});
					}

					const sliceType = config.sourceFile.addTypeAlias({
						name: pascalCase(
							`${config.rootModel.id} Document Data ${config.name} ${choiceId} Slice`,
						),
						type: `prismicT.Slice<"${choiceId}", ${
							primaryInterface
								? `Simplify<${primaryInterface.getName()}>`
								: "Record<string, never>"
						}, ${
							itemInterface ? `Simplify<${itemInterface.getName()}>` : "never"
						}>`,
					});

					choiceInterfaceNames.push(sliceType.getName());
				}
			}

			const slicesType = config.sourceFile.addTypeAlias({
				name: pascalCase(
					`${config.rootModel.id} Document Data ${config.name} Slice`,
				),
				type:
					choiceInterfaceNames.length > 0
						? choiceInterfaceNames.join(" | ")
						: "never",
			});

			config.interface.addProperty({
				name: config.name,
				type: `prismicT.SliceZone<${slicesType.getName()}>`,
				docs: buildFieldDocs({ field: config.field }),
			});

			break;
		}

		default: {
			config.interface.addProperty({
				name: config.name,
				type: "unknown",
				docs: buildFieldDocs({ field: config.field }),
			});
		}
	}
};

type AddInterfacePropertiesForFieldsConfig = Omit<
	AddInterfacePropertyFromFieldConfig,
	"name" | "field"
> & {
	fields: Record<string, AddInterfacePropertyFromFieldConfig["field"]>;
};

export const addInterfacePropertiesForFields = (
	config: AddInterfacePropertiesForFieldsConfig,
) => {
	for (const name in config.fields) {
		addInterfacePropertyFromField({
			...config,
			name,
			field: config.fields[name],
		});
	}
};
