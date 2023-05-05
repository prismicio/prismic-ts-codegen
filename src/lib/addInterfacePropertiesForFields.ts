import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/types";
import {
	CustomTypeModelSliceType,
	CustomTypeModelLinkSelectType,
} from "@prismicio/types";
import type { InterfaceDeclaration, SourceFile } from "ts-morph";

import { FieldConfigs, PathElement } from "../types";

import { buildFieldDocs } from "./buildFieldDocs";
import { buildSharedSliceInterfaceNamePart } from "./buildSharedSliceInterfaceNamePart";
import { buildTypeName } from "./buildTypeName";
import { getHumanReadableFieldPath } from "./getHumanReadableFieldPath";

type AddInterfacePropertyFromFieldConfig = {
	id: string;
	model: CustomTypeModelField;
	interface: InterfaceDeclaration;
	sourceFile: SourceFile;
	path: [
		PathElement<CustomTypeModel | SharedSliceModel>,
		...PathElement<CustomTypeModelField | CustomTypeModelSlice>[],
	];
	fieldConfigs: FieldConfigs;
	tabName?: string;
};

const addInterfacePropertyForField = (
	config: AddInterfacePropertyFromFieldConfig,
) => {
	switch (config.model.type) {
		case "UID": {
			// UID fields are not included in Data.
			break;
		}

		case "Boolean": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.BooleanField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "Color": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.ColorField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "Date": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.DateField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "Embed": {
			const providerTypes: string[] = [];

			if (config.fieldConfigs.embed?.providerTypes) {
				for (const providerType in config.fieldConfigs.embed?.providerTypes) {
					const configuredProviderType =
						config.fieldConfigs.embed?.providerTypes[providerType];

					providerTypes.push(
						`({ provider_name: "${providerType}" } & ${configuredProviderType})`,
					);
				}
			}

			config.interface.addProperty({
				name: config.id,
				type:
					providerTypes.length > 0
						? `prismicT.EmbedField<prismicT.AnyOEmbed & prismicT.OEmbedExtra & (${providerTypes.join(
								" | ",
						  )})>`
						: "prismicT.EmbedField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "GeoPoint": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.GeoPointField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "Image": {
			if (
				config.model.config?.thumbnails &&
				config.model.config.thumbnails.length > 0
			) {
				const thumbnailNames = config.model.config.thumbnails
					.map((thumbnail) => `"${thumbnail.name}"`)
					.join(" | ");

				config.interface.addProperty({
					name: config.id,
					type: `prismicT.ImageField<${thumbnailNames}>`,
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
						tabName: config.tabName,
					}),
				});
			} else {
				config.interface.addProperty({
					name: config.id,
					type: "prismicT.ImageField<never>",
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
						tabName: config.tabName,
					}),
				});
			}

			break;
		}

		case "IntegrationFields": {
			const catalogType = config.model.config?.catalog
				? config.fieldConfigs.integrationFields?.catalogTypes?.[
						config.model.config.catalog
				  ]
				: undefined;

			config.interface.addProperty({
				name: config.id,
				type: catalogType
					? `prismicT.IntegrationFields<${catalogType}>`
					: "prismicT.IntegrationFields",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "Link": {
			switch (config.model.config?.select) {
				case CustomTypeModelLinkSelectType.Document: {
					config.model.config;
					config.interface.addProperty({
						name: config.id,
						type:
							"customtypes" in config.model.config &&
							config.model.config.customtypes &&
							config.model.config.customtypes.length > 0
								? `prismicT.RelationField<${config.model.config.customtypes
										.map((type) => `"${type}"`)
										.join(" | ")}>`
								: "prismicT.RelationField",
						docs: buildFieldDocs({
							id: config.id,
							model: config.model,
							path: config.path,
							tabName: config.tabName,
						}),
					});

					break;
				}

				case CustomTypeModelLinkSelectType.Media: {
					config.interface.addProperty({
						name: config.id,
						type: "prismicT.LinkToMediaField",
						docs: buildFieldDocs({
							id: config.id,
							model: config.model,
							path: config.path,
							tabName: config.tabName,
						}),
					});

					break;
				}

				default: {
					config.interface.addProperty({
						name: config.id,
						type: "prismicT.LinkField",
						docs: buildFieldDocs({
							id: config.id,
							model: config.model,
							path: config.path,
							tabName: config.tabName,
						}),
					});
				}
			}

			break;
		}

		case "Number": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.NumberField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "StructuredText": {
			const isTitleField =
				config.model.config &&
				"single" in config.model.config &&
				config.model.config.single &&
				config.model.config.single
					.split(",")
					.every((blockType) => /heading/.test(blockType));

			if (isTitleField) {
				config.interface.addProperty({
					name: config.id,
					type: "prismicT.TitleField",
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
						tabName: config.tabName,
					}),
				});
			} else {
				config.interface.addProperty({
					name: config.id,
					type: "prismicT.RichTextField",
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
						tabName: config.tabName,
					}),
				});
			}

			break;
		}

		case "Select": {
			const options = config.model.config?.options
				?.map((option) => `"${option}"`)
				.join(" | ");
			const hasDefault = Boolean(config.model.config?.default_value);

			if (hasDefault) {
				config.interface.addProperty({
					name: config.id,
					type: `prismicT.SelectField<${options || "string"}, "filled">`,
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
						tabName: config.tabName,
					}),
				});
			} else {
				config.interface.addProperty({
					name: config.id,
					type: `prismicT.SelectField<${options}>`,
					docs: buildFieldDocs({
						id: config.id,
						model: config.model,
						path: config.path,
						tabName: config.tabName,
					}),
				});
			}

			break;
		}

		case "Text": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.KeyTextField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "Timestamp": {
			config.interface.addProperty({
				name: config.id,
				type: "prismicT.TimestampField",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "Group": {
			const itemInterface = config.sourceFile.addInterface({
				name: buildTypeName(
					config.path[0].id,
					"Document",
					"Data",
					config.id,
					"Item",
				),
				docs: [
					{
						description: (writer) => {
							const humanReadablePath = getHumanReadableFieldPath({
								path: [
									...config.path,
									{
										id: config.id,
										model: config.model,
									},
								],
							});

							writer.writeLine(`Item in ${humanReadablePath}`);
						},
					},
				],
				isExported: true,
			});

			if (config.model.config?.fields) {
				addInterfacePropertiesForFields({
					interface: itemInterface,
					sourceFile: config.sourceFile,
					fields: config.model.config.fields,
					path: [
						...config.path,
						{
							id: config.id,
							model: config.model,
						},
					],
					fieldConfigs: config.fieldConfigs,
				});
			}

			config.interface.addProperty({
				name: config.id,
				type: `prismicT.GroupField<Simplify<${itemInterface.getName()}>>`,
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		case "Slices": {
			const choiceInterfaceNames: string[] = [];

			if (config.model.config?.choices) {
				for (const choiceId in config.model.config.choices) {
					const choice = config.model.config.choices[choiceId];

					if (choice.type === CustomTypeModelSliceType.SharedSlice) {
						choiceInterfaceNames.push(
							buildSharedSliceInterfaceNamePart({ id: choiceId }),
						);
					} else if (choice.type === CustomTypeModelSliceType.Slice) {
						let primaryInterface: InterfaceDeclaration | undefined;
						if (
							choice["non-repeat"] &&
							Object.keys(choice["non-repeat"]).length > 0
						) {
							primaryInterface = config.sourceFile.addInterface({
								name: buildTypeName(
									config.path[0].id,
									"Document",
									"Data",
									config.id,
									choiceId,
									"Slice",
									"Primary",
								),
								docs: [
									{
										description: (writer) => {
											const humanReadablePath = getHumanReadableFieldPath({
												path: [
													...config.path,
													{
														id: config.id,
														model: config.model,
													},
													{
														id: choiceId,
														model: choice,
													},
													{
														id: "primary",
														label: "Primary",
													},
												],
											});

											writer.writeLine(
												`Primary content in ${humanReadablePath}`,
											);
										},
									},
								],
							});
							addInterfacePropertiesForFields({
								interface: primaryInterface,
								sourceFile: config.sourceFile,
								fields: choice["non-repeat"],
								path: [
									...config.path,
									{
										id: config.id,
										model: config.model,
									},
									{
										id: choiceId,
										model: choice,
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
						if (choice.repeat && Object.keys(choice.repeat).length > 0) {
							itemInterface = config.sourceFile.addInterface({
								name: buildTypeName(
									config.path[0].id,
									"Document",
									"Data",
									config.id,
									choiceId,
									"Slice",
									"Item",
								),
								docs: [
									{
										description: (writer) => {
											const humanReadablePath = getHumanReadableFieldPath({
												path: [
													...config.path,
													{
														id: config.id,
														model: config.model,
													},
													{
														id: choiceId,
														model: choice,
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
								fields: choice.repeat,
								path: [
									...config.path,
									{
										id: config.id,
										model: config.model,
									},
									{
										id: choiceId,
										model: choice,
									},
									{
										id: "items",
										label: "Items",
									},
								],
								fieldConfigs: config.fieldConfigs,
							});
						}

						const sliceType = config.sourceFile.addTypeAlias({
							name: buildTypeName(
								config.path[0].id,
								"Document",
								"Data",
								config.id,
								choiceId,
								"Slice",
							),
							type: `prismicT.Slice<"${choiceId}", ${
								primaryInterface
									? `Simplify<${primaryInterface.getName()}>`
									: "Record<string, never>"
							}, ${
								itemInterface ? `Simplify<${itemInterface.getName()}>` : "never"
							}>`,
							isExported: true,
						});

						choiceInterfaceNames.push(sliceType.getName());
					}
				}
			}

			const slicesType = config.sourceFile.addTypeAlias({
				name: buildTypeName(
					config.path[0].id,
					"Document",
					"Data",
					config.id,
					"Slice",
				),
				type:
					choiceInterfaceNames.length > 0
						? choiceInterfaceNames.join(" | ")
						: "never",
				docs: [
					{
						description: (writer) => {
							const humanReadablePath = getHumanReadableFieldPath({
								path: [
									...config.path,
									{
										id: config.id,
										model: config.model,
									},
								],
							});

							writer.writeLine(`Slice for *${humanReadablePath}*`);
						},
					},
				],
			});

			config.interface.addProperty({
				name: config.id,
				type: `prismicT.SliceZone<${slicesType.getName()}>`,
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});

			break;
		}

		default: {
			config.interface.addProperty({
				name: config.id,
				type: "unknown",
				docs: buildFieldDocs({
					id: config.id,
					model: config.model,
					path: config.path,
					tabName: config.tabName,
				}),
			});
		}
	}
};

type AddInterfacePropertiesForFieldsConfig = Omit<
	AddInterfacePropertyFromFieldConfig,
	"id" | "model"
> & {
	fields: Record<string, AddInterfacePropertyFromFieldConfig["model"]>;
	tabName?: string;
};

export const addInterfacePropertiesForFields = (
	config: AddInterfacePropertiesForFieldsConfig,
) => {
	for (const name in config.fields) {
		addInterfacePropertyForField({
			...config,
			id: name.includes("-") || name.includes(":") || /^[0-9]/.test(name) ? `"${name}"` : name,
			model: config.fields[name],
			tabName: config.tabName,
		});
	}
};
