import type { SharedSliceModel } from "@prismicio/client";
import { source, stripIndent } from "common-tags";
import QuickLRU from "quick-lru";

import { FieldConfigs, FieldPath } from "../types";

import { SHARED_SLICES_DOCUMENTATION_URL } from "../constants";

import { addSection } from "./addSection";
import { buildFieldProperties } from "./buildFieldProperties";
import { buildTypeName } from "./buildTypeName";
import { buildUnion } from "./buildUnion";
import { getCacheKey } from "./getCacheKey";
import { getHumanReadableModelName } from "./getHumanReadableModelName";
import { getHumanReadablePath } from "./getHumanReadablePath";

type BuildSharedSliceTypeArgs = {
	model: SharedSliceModel;
	fieldConfigs: FieldConfigs;
	cache?: QuickLRU<string, unknown>;
};

type BuildSharedSliceTypeReturnValue = {
	name: string;
	variationNames: string[];
	code: string;
	contentTypeNames: string[];
};

export function buildSharedSliceType(
	args: BuildSharedSliceTypeArgs,
): BuildSharedSliceTypeReturnValue {
	if (args.cache) {
		const key = getCacheKey([args.model, args.fieldConfigs]);
		const cached = args.cache.get(key);

		if (cached) {
			return cached as BuildSharedSliceTypeReturnValue;
		}
	}

	let code = "";
	const contentTypeNames: string[] = [];

	const name = buildTypeName(args.model.id, "Slice");
	const humanReadableName = getHumanReadableModelName({
		name: args.model.id,
		model: args.model,
	});

	const variationNames: string[] = [];
	for (const variationModel of args.model.variations) {
		const variationName = buildTypeName(name, variationModel.id);

		let primaryInterfaceName: string | undefined;
		if (
			variationModel.primary &&
			Object.keys(variationModel.primary).length > 0
		) {
			primaryInterfaceName = buildTypeName(variationName, "Primary");

			const path: FieldPath = [
				{
					name: args.model.id,
					model: args.model,
				},
				{
					name: "primary",
					label: "Primary",
				},
			];
			const humanReadablePath = getHumanReadablePath({ path });

			const primaryFieldProperties = buildFieldProperties({
				fields: variationModel.primary,
				fieldConfigs: args.fieldConfigs,
				path,
			});

			contentTypeNames.push(...primaryFieldProperties.contentTypeNames);
			contentTypeNames.push(primaryInterfaceName);

			const docs = stripIndent`
				/**
				 * Primary content in *${humanReadablePath}*
				 */
			`;

			code = addSection(
				primaryFieldProperties.code
					? source`
						${docs}
						export interface ${primaryInterfaceName} {
							${primaryFieldProperties.code}
						}
					`
					: source`
						${docs}
						export interface ${primaryInterfaceName} {}
					`,
				code,
			);
		}

		let itemInterfaceName: string | undefined;
		if (variationModel.items && Object.keys(variationModel.items).length > 0) {
			itemInterfaceName = buildTypeName(variationName, "Item");

			const path: FieldPath = [
				{
					name: args.model.id,
					model: args.model,
				},
				{
					name: "items",
					label: "Items",
				},
			];
			const humanReadablePath = getHumanReadablePath({ path });

			const itemFieldProperties = buildFieldProperties({
				fields: variationModel.items,
				fieldConfigs: args.fieldConfigs,
				path,
			});

			contentTypeNames.push(...itemFieldProperties.contentTypeNames);
			contentTypeNames.push(itemInterfaceName);

			const docs = stripIndent`
				/**
				 * Primary content in *${humanReadablePath}*
				 */
			`;

			code = addSection(
				itemFieldProperties.code
					? source`
						${docs}
						export interface ${itemInterfaceName} {
							${itemFieldProperties.code}
						}
					`
					: source`
						${docs}
						export interface ${itemInterfaceName} {}
					`,
				code,
			);
		}

		code = addSection(
			source`
				/**
				 * ${variationModel.name} variation for ${humanReadableName} Slice
				 *
				 * - **API ID**: \`${variationModel.id}\`
				 * - **Description**: ${variationModel.description || "*None*"}
				 * - **Documentation**: ${SHARED_SLICES_DOCUMENTATION_URL}
				 */
				export type ${variationName} = prismic.SharedSliceVariation<"${
				variationModel.id
			}", ${
				primaryInterfaceName
					? `Simplify<${primaryInterfaceName}>`
					: `Record<string, never>`
			}, ${itemInterfaceName ? `Simplify<${itemInterfaceName}>` : `never`}>;
			`,
			code,
		);

		variationNames.push(variationName);
	}

	const variationUnionName = buildTypeName(name, "Variation");
	const variationsUnion = buildUnion(variationNames);

	contentTypeNames.push(variationUnionName);
	contentTypeNames.push(...variationNames);

	code = addSection(
		source`
			/**
			 * Slice variation for *${humanReadableName}*
			 */
			type ${variationUnionName} = ${
			variationNames.length > 0 ? variationsUnion : "never"
		}
		`,
		code,
	);

	code = addSection(
		source`
			/**
			 * ${humanReadableName} Shared Slice
			 *
			 * - **API ID**: \`${args.model.id}\`
			 * - **Description**: ${args.model.description || "*None*"}
			 * - **Documentation**: ${SHARED_SLICES_DOCUMENTATION_URL}
			 */
			export type ${name} = prismic.SharedSlice<"${
			args.model.id
		}", ${variationUnionName}>;
		`,
		code,
	);

	const result = {
		name,
		variationNames,
		code,
		contentTypeNames,
	};

	if (args.cache) {
		const key = getCacheKey([args.model, args.fieldConfigs]);

		args.cache.set(key, result);
	}

	return result;
}
