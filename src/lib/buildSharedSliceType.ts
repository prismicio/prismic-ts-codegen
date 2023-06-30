import { SharedSliceModel } from "@prismicio/client";
import { source } from "common-tags";

import { Cache, FieldConfigs } from "../types";

import { addSection } from "./addSection";
import { buildFieldProperties } from "./buildFieldProperties";
import { buildTypeName } from "./buildTypeName";
import { buildUnion } from "./buildUnion";
import { createContentDigest } from "./createContentDigest";

type BuildSharedSliceTypeArgs = {
	model: SharedSliceModel;
	fieldConfigs: FieldConfigs;
	cache?: Cache;
};

type BuildSharedSliceTypeReturnValue = {
	name: string;
	variationUnionName: string;
	variationNames: string[];
	code: string;
};

export function buildSharedSliceType(
	args: BuildSharedSliceTypeArgs,
): BuildSharedSliceTypeReturnValue {
	if (args.cache) {
		const key = createContentDigest(
			JSON.stringify([args.model, args.fieldConfigs]),
		);
		const cached = args.cache.get(key);

		if (cached) {
			return cached as BuildSharedSliceTypeReturnValue;
		}
	}

	let code = "";

	const name = buildTypeName(args.model.id, "Slice");

	const variationNames: string[] = [];
	for (const variationModel of args.model.variations) {
		const variationName = buildTypeName(name, variationModel.id);

		let primaryInterfaceName: string | undefined;
		if (
			variationModel.primary &&
			Object.keys(variationModel.primary).length > 0
		) {
			primaryInterfaceName = buildTypeName(variationName, "Primary");
			const primaryFieldProperties = buildFieldProperties({
				fields: variationModel.primary,
				fieldConfigs: args.fieldConfigs,
				path: [
					{
						id: args.model.id,
						model: args.model,
					},
					{
						id: "primary",
						label: "Primary",
					},
				],
			});

			code = addSection(
				primaryFieldProperties.code
					? source`
						export interface ${primaryInterfaceName} {
							${primaryFieldProperties.code}
						}
					`
					: `export interface ${primaryInterfaceName} {}`,
				code,
			);
		}

		let itemInterfaceName: string | undefined;
		if (variationModel.items && Object.keys(variationModel.items).length > 0) {
			itemInterfaceName = buildTypeName(variationName, "Item");
			const itemFieldProperties = buildFieldProperties({
				fields: variationModel.items,
				fieldConfigs: args.fieldConfigs,
				path: [
					{
						id: args.model.id,
						model: args.model,
					},
					{
						id: "items",
						label: "Items",
					},
				],
			});

			code = addSection(
				itemFieldProperties.code
					? source`
						export interface ${itemInterfaceName} {
							${itemFieldProperties.code}
						}
					`
					: `export interface ${itemInterfaceName} {}`,
				code,
			);
		}

		code = addSection(
			`export type ${variationName} = prismic.SharedSliceVariation<"${
				variationModel.id
			}", ${
				primaryInterfaceName
					? `Simplify<${primaryInterfaceName}>`
					: `Record<string, never>`
			}, ${itemInterfaceName ? `Simplify<${itemInterfaceName}>` : `never`}>;`,
			code,
		);

		variationNames.push(variationName);
	}

	const variationUnionName = buildTypeName(name, "Variation");
	const variationsUnion = buildUnion(variationNames);

	code = addSection(
		`type ${variationUnionName} = ${
			variationNames.length > 0 ? variationsUnion : "never"
		}`,
		code,
	);

	code = addSection(
		`export type ${name} = prismic.SharedSlice<"${args.model.id}", ${variationUnionName}>;`,
		code,
	);

	const result = {
		name,
		variationUnionName,
		variationNames,
		code,
	};

	if (args.cache) {
		const key = createContentDigest(
			JSON.stringify([args.model, args.fieldConfigs]),
		);

		args.cache.set(key, result);
	}

	return result;
}
