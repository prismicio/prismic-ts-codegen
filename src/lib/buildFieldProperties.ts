import {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelFieldType,
	CustomTypeModelLinkSelectType,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/client";
import { source as typescript } from "common-tags";

import { AuxiliaryType, FieldConfigs, PathElement } from "../types";

import { addSection } from "./addSection";
import { buildPropertyName } from "./buildPropertyName";
import { buildTypeName } from "./buildTypeName";
import { buildUnion } from "./buildUnion";

type BuildFieldPropertyArgs = Pick<
	BuildFieldPropertiesArgs,
	"path" | "fieldConfigs"
> & {
	name: string;
	field: CustomTypeModelField;
};

type BuildFieldPropertyReturnType = {
	code: string;
	auxiliaryTypes: AuxiliaryType[];
};

function buildFieldProperty(
	args: BuildFieldPropertyArgs,
): BuildFieldPropertyReturnType {
	let code = "";

	const auxiliaryTypes: AuxiliaryType[] = [];

	const name = buildPropertyName(args.name);

	switch (args.field.type) {
		case CustomTypeModelFieldType.UID: {
			// UID fields are not included in Data.
			break;
		}

		case CustomTypeModelFieldType.Boolean: {
			code = addSection(
				typescript`
					${name}: prismic.BooleanField;
				`,
				code,
			);

			break;
		}

		case CustomTypeModelFieldType.Color: {
			code = addSection(
				typescript`
					${name}: prismic.ColorField;
				`,
				code,
			);

			break;
		}

		case CustomTypeModelFieldType.Date: {
			code = addSection(
				typescript`
					${name}: prismic.DateField;
				`,
				code,
			);

			break;
		}

		case CustomTypeModelFieldType.Embed: {
			const providerTypes: string[] = [];

			if (args.fieldConfigs.embed?.providerTypes) {
				for (const providerType in args.fieldConfigs.embed?.providerTypes) {
					const configuredProviderType =
						args.fieldConfigs.embed?.providerTypes[providerType];

					providerTypes.push(
						typescript`
							({ provider_name: "${providerType}" } & ${configuredProviderType})
						`,
					);
				}
			}

			const providerTypesUnion = buildUnion(providerTypes);

			code = addSection(
				providerTypes.length > 0
					? typescript`
						${name}: prismic.EmbedField<prismic.AnyOEmbed & prismic.OEmbedExtra & (${providerTypesUnion})>
					`
					: typescript`
						${name}: prismic.EmbedField
					`,
				code,
			);

			break;
		}

		case CustomTypeModelFieldType.GeoPoint: {
			code = addSection(
				typescript`
					${name}: prismic.GeoPointField;
				`,
				code,
			);

			break;
		}

		case CustomTypeModelFieldType.Image: {
			if (
				args.field.config?.thumbnails &&
				args.field.config.thumbnails.length > 0
			) {
				const thumbnailNames = buildUnion(
					args.field.config.thumbnails.map((thumb) => `"${thumb.name}"`),
				);

				code = addSection(
					typescript`
						${name}: prismic.ImageField<${thumbnailNames}>;
					`,
					code,
				);
			} else {
				code = addSection(
					typescript`
						${name}: prismic.ImageField<never>;
					`,
					code,
				);
			}

			break;
		}

		case CustomTypeModelFieldType.Integration: {
			const catalogType = args.field.config?.catalog
				? args.fieldConfigs.integrationFields?.catalogTypes?.[
						args.field.config.catalog
				  ]
				: undefined;

			if (catalogType) {
				code = addSection(
					typescript`
						${name}: prismic.IntegrationField<${catalogType}>;
					`,
					code,
				);
			} else {
				code = addSection(
					typescript`
						${name}: prismic.IntegrationField;
					`,
					code,
				);
			}

			break;
		}

		case CustomTypeModelFieldType.Link: {
			switch (args.field.config?.select) {
				case CustomTypeModelLinkSelectType.Document: {
					if (
						"customtypes" in args.field.config &&
						args.field.config.customtypes &&
						args.field.config.customtypes.length > 0
					) {
						const customTypeIDsUnion = buildUnion(
							args.field.config.customtypes.map((type) => `"${type}"`),
						);

						code = addSection(
							typescript`
							${name}: prismic.ContentRelationshipField<${customTypeIDsUnion}>;
						`,
							code,
						);
					} else {
						code = addSection(
							typescript`
							${name}: prismic.ContentRelationshipField;
						`,
							code,
						);
					}

					break;
				}

				case CustomTypeModelLinkSelectType.Media: {
					code = addSection(
						typescript`
							${name}: prismic.LinkToMediaField;
						`,
						code,
					);

					break;
				}

				default: {
					code = addSection(
						typescript`
							${name}: prismic.LinkField;
						`,
						code,
					);
				}
			}

			break;
		}

		case CustomTypeModelFieldType.Number: {
			code = addSection(
				typescript`
					${name}: prismic.NumberField;
				`,
				code,
			);

			break;
		}

		case CustomTypeModelFieldType.StructuredText: {
			const isTitleField =
				args.field.config &&
				"single" in args.field.config &&
				args.field.config.single &&
				args.field.config.single
					.split(",")
					.every((blockType) => /heading/.test(blockType));

			if (isTitleField) {
				code = addSection(
					typescript`
						${name}: prismic.TitleField;
					`,
					code,
				);
			} else {
				code = addSection(
					typescript`
						${name}: prismic.RichTextField;
					`,
					code,
				);
			}

			break;
		}

		case CustomTypeModelFieldType.Select: {
			const options: string[] =
				args.field.config?.options?.map((option) => `"${option}"`) || [];
			const optionsType = options.length ? buildUnion(options) : "string";

			const hasDefault = Boolean(args.field.config?.default_value);

			if (hasDefault) {
				code = addSection(
					typescript`
						${name}: prismic.SelectField<${optionsType}, "filled">;
					`,
					code,
				);
			} else {
				code = addSection(
					typescript`
						${name}: prismic.SelectField${options.length > 0 ? `<${optionsType}>` : ""};
					`,
					code,
				);
			}

			break;
		}

		case CustomTypeModelFieldType.Text: {
			code = addSection(
				typescript`
					${name}: prismic.KeyTextField;
				`,
				code,
			);

			break;
		}

		case CustomTypeModelFieldType.Timestamp: {
			code = addSection(
				typescript`
					${name}: prismic.TimestampField;
				`,
				code,
			);

			break;
		}

		case CustomTypeModelFieldType.Group: {
			const itemName = buildTypeName(
				args.path[0].id,
				"Document",
				"Data",
				args.name,
				"Item",
			);

			const itemFieldProperties = buildFieldProperties({
				fields: args.field.config?.fields || {},
				fieldConfigs: args.fieldConfigs,
				path: [
					...args.path,
					{
						id: name,
						model: args.field,
					},
				],
			});

			auxiliaryTypes.push({
				name: itemName,
				code: typescript`
					export interface ${itemName} {
						${itemFieldProperties.code}
					}
				`,
			});

			code = addSection(
				typescript`
					${name}: prismic.GroupField<Simplify<${itemName}>>;
				`,
				code,
			);

			break;
		}

		case CustomTypeModelFieldType.Slices: {
			const choiceNames: string[] = [];

			for (const choiceID in args.field.config?.choices) {
				const choice = args.field.config.choices[choiceID];

				if (choice.type === "SharedSlice") {
					// TODO: Verify that the Shared Slice
					// is provided to the global
					// `sharedSlices` array. If it is not,
					// the type won't exist, so we can't
					// add it to the union. We should
					// probably throw an error if we reach
					// that state, or maybe the input can
					// be validated early so we don't
					// generate any code using invalid
					// models.
					choiceNames.push(buildTypeName(choiceID, "Slice"));
				} else if (choice.type === "Slice") {
					const sliceName = buildTypeName(
						args.path[0].id,
						"Document",
						"Data",
						args.name,
						choiceID,
						"Slice",
					);

					let primaryInterfaceName: string | undefined;
					if (
						choice["non-repeat"] &&
						Object.keys(choice["non-repeat"]).length > 0
					) {
						primaryInterfaceName = buildTypeName(sliceName, "Primary");
						const primaryFieldProperties = buildFieldProperties({
							fields: choice["non-repeat"],
							fieldConfigs: args.fieldConfigs,
							path: [
								...args.path,
								{
									id: args.name,
									model: args.field,
								},
								{
									id: choiceID,
									model: choice,
								},
								{
									id: "primary",
									label: "Primary",
								},
							],
						});

						auxiliaryTypes.push({
							name: primaryInterfaceName,
							code: primaryFieldProperties.code
								? typescript`
									export interface ${primaryInterfaceName} {
										${primaryFieldProperties.code}
									}
								`
								: typescript`
									export interface ${primaryInterfaceName} {}
								`,
						});
					}

					let itemInterfaceName: string | undefined;
					if (choice.repeat && Object.keys(choice.repeat).length > 0) {
						itemInterfaceName = buildTypeName(sliceName, "Item");

						const itemFieldProperties = buildFieldProperties({
							fields: choice.repeat,
							fieldConfigs: args.fieldConfigs,
							path: [
								...args.path,
								{
									id: args.name,
									model: args.field,
								},
								{
									id: choiceID,
									model: choice,
								},
								{
									id: "items",
									label: "Items",
								},
							],
						});

						auxiliaryTypes.push({
							name: itemInterfaceName,
							code: itemFieldProperties.code
								? typescript`
									export interface ${itemInterfaceName} {
										${itemFieldProperties.code}
									}
								`
								: typescript`
									export interface ${itemInterfaceName} {}
								`,
						});
					}

					auxiliaryTypes.push({
						name: sliceName,
						code: typescript`
							export type ${sliceName} = prismic.Slice<"${choiceID}", ${
							primaryInterfaceName
								? typescript`Simplify<${primaryInterfaceName}>`
								: typescript`Record<string, never>`
						}, ${
							itemInterfaceName
								? typescript`Simplify<${itemInterfaceName}>`
								: typescript`never`
						}>
						`,
					});

					choiceNames.push(sliceName);
				}
			}

			const choiceUnionName = buildTypeName(
				args.path[0].id,
				"Document",
				"Data",
				args.name,
				"Slice",
			);
			const choiceUnion = buildUnion(choiceNames);
			auxiliaryTypes.push({
				name: choiceUnionName,
				code: typescript`
					type ${choiceUnionName} = ${choiceUnion}
				`,
			});

			code = addSection(
				typescript`
					${name}: prismic.SliceZone<${choiceUnionName}>;
				`,
				code,
			);

			break;
		}

		default: {
			code = addSection(
				typescript`
					${name}: unknown;
				`,
				code,
			);
		}
	}

	return {
		code,
		auxiliaryTypes,
	};
}

type BuildFieldPropertiesArgs = {
	fields: Record<string, CustomTypeModelField>;
	path: [
		PathElement<CustomTypeModel | SharedSliceModel>,
		...PathElement<CustomTypeModelField | CustomTypeModelSlice>[],
	];
	fieldConfigs: FieldConfigs;
};

type BuildFieldPropertiesReturnType = {
	code: string;
	auxiliaryTypes: AuxiliaryType[];
};

export function buildFieldProperties(
	args: BuildFieldPropertiesArgs,
): BuildFieldPropertiesReturnType {
	let code = "";

	const auxiliaryTypes: AuxiliaryType[] = [];

	for (const name in args.fields) {
		const field = args.fields[name];

		const fieldProperty = buildFieldProperty({
			name,
			field,
			path: args.path,
			fieldConfigs: args.fieldConfigs,
		});

		code = addSection(fieldProperty.code, code);

		auxiliaryTypes.push(...fieldProperty.auxiliaryTypes);
	}

	return {
		code,
		auxiliaryTypes,
	};
}
