import type { CustomTypeModelField } from "@prismicio/client";
import { source, stripIndent } from "common-tags";

import { AuxiliaryType, FieldConfigs, FieldPath } from "../types";

import { addLine } from "./addLine";
import { addSection } from "./addSection";
import { buildFieldDocs } from "./buildFieldDocs";
import { buildTypeName } from "./buildTypeName";
import { buildUnion } from "./buildUnion";
import { getHumanReadablePath } from "./getHumanReadablePath";

type BuildFieldPropertyArgs = Pick<
	BuildFieldPropertiesArgs,
	"path" | "fieldConfigs" | "tabName"
> & {
	name: string;
	field: CustomTypeModelField;
};

type BuildFieldPropertyReturnType = {
	code: string;
	auxiliaryTypes: AuxiliaryType[];
	contentTypeNames: string[];
};

function buildFieldProperty(
	args: BuildFieldPropertyArgs,
): BuildFieldPropertyReturnType {
	let code = buildFieldDocs({
		name: args.name,
		field: args.field,
		path: args.path,
		tabName: args.tabName,
	});

	const auxiliaryTypes: AuxiliaryType[] = [];
	const contentTypeNames: string[] = [];

	const name =
		args.name.includes("-") ||
		args.name.includes(":") ||
		/^[0-9]/.test(args.name)
			? `"${args.name}"`
			: args.name;

	switch (args.field.type) {
		case "UID": {
			// UID fields are not included in Data.
			break;
		}

		case "Boolean": {
			code = addLine(`${name}: prismic.BooleanField;`, code);

			break;
		}

		case "Color": {
			code = addLine(`${name}: prismic.ColorField;`, code);

			break;
		}

		case "Date": {
			code = addLine(`${name}: prismic.DateField;`, code);

			break;
		}

		case "Embed": {
			const providerTypes: string[] = [];

			if (args.fieldConfigs.embed?.providerTypes) {
				for (const providerType in args.fieldConfigs.embed?.providerTypes) {
					const configuredProviderType =
						args.fieldConfigs.embed?.providerTypes[providerType];

					providerTypes.push(
						`({ provider_name: "${providerType}" } & ${configuredProviderType})`,
					);
				}
			}

			const providerTypesUnion = buildUnion(providerTypes);

			code =
				providerTypes.length > 0
					? addLine(
							`${name}: prismic.EmbedField<prismic.AnyOEmbed & prismic.OEmbedExtra & (${providerTypesUnion})>`,
							code,
					  )
					: addLine(`${name}: prismic.EmbedField`, code);

			break;
		}

		case "GeoPoint": {
			code = addLine(`${name}: prismic.GeoPointField;`, code);

			break;
		}

		case "Image": {
			if (
				args.field.config?.thumbnails &&
				args.field.config.thumbnails.length > 0
			) {
				const thumbnailNames = buildUnion(
					args.field.config.thumbnails.map((thumb) => `"${thumb.name}"`),
				);

				code = addLine(`${name}: prismic.ImageField<${thumbnailNames}>;`, code);
			} else {
				code = addLine(`${name}: prismic.ImageField<never>;`, code);
			}

			break;
		}

		case "IntegrationFields": {
			const catalogType = args.field.config?.catalog
				? args.fieldConfigs.integrationFields?.catalogTypes?.[
						args.field.config.catalog
				  ]
				: undefined;

			if (catalogType) {
				code = addLine(
					`${name}: prismic.IntegrationField<${catalogType}>;`,
					code,
				);
			} else {
				code = addLine(`${name}: prismic.IntegrationField;`, code);
			}

			break;
		}

		case "Link": {
			switch (args.field.config?.select) {
				case "document": {
					if (
						"customtypes" in args.field.config &&
						args.field.config.customtypes &&
						args.field.config.customtypes.length > 0
					) {
						const customTypeIDsUnion = buildUnion(
							args.field.config.customtypes.map((type) => `"${type}"`),
						);

						code = addLine(
							`${name}: prismic.ContentRelationshipField<${customTypeIDsUnion}>;`,
							code,
						);
					} else {
						code = addLine(`${name}: prismic.ContentRelationshipField;`, code);
					}

					break;
				}

				case "media": {
					code = addLine(`${name}: prismic.LinkToMediaField;`, code);

					break;
				}

				default: {
					code = addLine(`${name}: prismic.LinkField;`, code);
				}
			}

			break;
		}

		case "Number": {
			code = addLine(`${name}: prismic.NumberField;`, code);

			break;
		}

		case "StructuredText": {
			const isTitleField =
				args.field.config &&
				"single" in args.field.config &&
				args.field.config.single &&
				args.field.config.single
					.split(",")
					.every((blockType) => /heading/.test(blockType));

			if (isTitleField) {
				code = addLine(`${name}: prismic.TitleField;`, code);
			} else {
				code = addLine(`${name}: prismic.RichTextField;`, code);
			}

			break;
		}

		case "Select": {
			const options: string[] =
				args.field.config?.options?.map((option) => `"${option}"`) || [];
			const optionsType = options.length ? buildUnion(options) : "string";

			const hasDefault = Boolean(args.field.config?.default_value);

			if (hasDefault) {
				code = addLine(
					`${name}: prismic.SelectField<${optionsType}, "filled">;`,
					code,
				);
			} else {
				code = addLine(
					`${name}: prismic.SelectField${
						options.length > 0 ? `<${optionsType}>` : ""
					};`,
					code,
				);
			}

			break;
		}

		case "Text": {
			code = addLine(`${name}: prismic.KeyTextField;`, code);

			break;
		}

		case "Timestamp": {
			code = addLine(`${name}: prismic.TimestampField;`, code);

			break;
		}

		case "Group": {
			const itemName = buildTypeName(
				args.path[0].name,
				"Document",
				"Data",
				args.name,
				"Item",
			);

			const path: FieldPath = [
				...args.path,
				{
					name: name,
					model: args.field,
				},
			];
			const humanReadablePath = getHumanReadablePath({ path });

			const itemFieldProperties = buildFieldProperties({
				fields: args.field.config?.fields || {},
				fieldConfigs: args.fieldConfigs,
				path,
			});

			auxiliaryTypes.push({
				name: itemName,
				code: source`
					/**
					 * Item in *${humanReadablePath}*
					 */
					export interface ${itemName} {
						${itemFieldProperties.code}
					}
				`,
			});
			contentTypeNames.push(itemName);

			code = addLine(
				`${name}: prismic.GroupField<Simplify<${itemName}>>;`,
				code,
			);

			break;
		}

		case "Slices": {
			const choiceNames: string[] = [];

			if (args.field.config?.choices) {
				for (const choiceID in args.field.config.choices) {
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
							args.path[0].name,
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

							const path: FieldPath = [
								...args.path,
								{
									name: args.name,
									model: args.field,
								},
								{
									name: choiceID,
									model: choice,
								},
								{
									name: "primary",
									label: "Primary",
								},
							];
							const humanReadablePath = getHumanReadablePath({ path });

							const primaryFieldProperties = buildFieldProperties({
								fields: choice["non-repeat"],
								fieldConfigs: args.fieldConfigs,
								path,
							});

							let primaryCode = stripIndent`
								/**
								 * Primary content in *${humanReadablePath}*
								 */
							`;
							primaryCode = primaryFieldProperties.code
								? addLine(
										source`
											export interface ${primaryInterfaceName} {
												${primaryFieldProperties.code}
											}
										`,
										primaryCode,
								  )
								: addLine(
										`export interface ${primaryInterfaceName} {}`,
										primaryCode,
								  );

							auxiliaryTypes.push({
								name: primaryInterfaceName,
								code: primaryCode,
							});
							contentTypeNames.push(primaryInterfaceName);
						}

						let itemInterfaceName: string | undefined;
						if (choice.repeat && Object.keys(choice.repeat).length > 0) {
							itemInterfaceName = buildTypeName(sliceName, "Item");

							const path: FieldPath = [
								...args.path,
								{
									name: args.name,
									model: args.field,
								},
								{
									name: choiceID,
									model: choice,
								},
								{
									name: "items",
									label: "Items",
								},
							];
							const humanReadablePath = getHumanReadablePath({ path });

							const itemFieldProperties = buildFieldProperties({
								fields: choice.repeat,
								fieldConfigs: args.fieldConfigs,
								path,
							});

							let itemCode = stripIndent`
								/**
								 * Item content in *${humanReadablePath}*
								 */
							`;
							itemCode = itemFieldProperties.code
								? addLine(
										source`
											export interface ${itemInterfaceName} {
												${itemFieldProperties.code}
											}
										`,
										itemCode,
								  )
								: addLine(`export interface ${itemInterfaceName} {}`, itemCode);

							auxiliaryTypes.push({
								name: itemInterfaceName,
								code: itemCode,
							});
							contentTypeNames.push(itemInterfaceName);
						}

						auxiliaryTypes.push({
							name: sliceName,
							code: stripIndent`
								/**
								 * Slice for *${getHumanReadablePath({
										path: [
											...args.path,
											{
												name: args.name,
												model: args.field,
											},
										],
									})}*
								 */
								export type ${sliceName} = prismic.Slice<"${choiceID}", ${
								primaryInterfaceName
									? `Simplify<${primaryInterfaceName}>`
									: `Record<string, never>`
							}, ${
								itemInterfaceName ? `Simplify<${itemInterfaceName}>` : `never`
							}>
							`,
						});

						choiceNames.push(sliceName);
					}
				}
			}

			const choiceUnionName = buildTypeName(
				args.path[0].name,
				"Document",
				"Data",
				args.name,
				"Slice",
			);
			const choiceUnion = buildUnion(choiceNames);
			auxiliaryTypes.push({
				name: choiceUnionName,
				code: `type ${choiceUnionName} = ${choiceUnion}`,
			});
			contentTypeNames.push(choiceUnionName);

			code = addLine(`${name}: prismic.SliceZone<${choiceUnionName}>;`, code);

			break;
		}

		default: {
			code = addLine(`${name}: unknown;`, code);
		}
	}

	return {
		code,
		auxiliaryTypes,
		contentTypeNames,
	};
}

type BuildFieldPropertiesArgs = {
	fields: Record<string, CustomTypeModelField>;
	path: FieldPath;
	fieldConfigs: FieldConfigs;
	tabName?: string;
};

type BuildFieldPropertiesReturnType = {
	code: string;
	auxiliaryTypes: AuxiliaryType[];
	contentTypeNames: string[];
};

export function buildFieldProperties(
	args: BuildFieldPropertiesArgs,
): BuildFieldPropertiesReturnType {
	let code = "";

	const auxiliaryTypes: AuxiliaryType[] = [];
	const contentTypeNames: string[] = [];

	for (const name in args.fields) {
		const field = args.fields[name];

		const fieldProperty = buildFieldProperty({
			name,
			field,
			path: args.path,
			fieldConfigs: args.fieldConfigs,
			tabName: args.tabName,
		});

		code = addSection(fieldProperty.code, code);

		auxiliaryTypes.push(...fieldProperty.auxiliaryTypes);
		contentTypeNames.push(...fieldProperty.contentTypeNames);
	}

	return {
		code,
		auxiliaryTypes,
		contentTypeNames,
	};
}
