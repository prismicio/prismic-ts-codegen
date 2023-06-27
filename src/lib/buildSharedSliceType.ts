import { SharedSliceModel } from "@prismicio/client";
import { source as typescript } from "common-tags";

import { FieldConfigs } from "../types";

import { addSection } from "./addSection";
import { buildFieldProperties } from "./buildFieldProperties";
import { buildTypeName } from "./buildTypeName";
import { buildUnion } from "./buildUnion";

type BuildSharedSliceTypeArgs = {
	model: SharedSliceModel;
	fieldConfigs: FieldConfigs;
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
					? typescript`
						export interface ${primaryInterfaceName} {
							${primaryFieldProperties.code}
						}
					`
					: typescript`
						export interface ${primaryInterfaceName} {}
					`,
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
					? typescript`
						export interface ${itemInterfaceName} {
							${itemFieldProperties.code}
						}
					`
					: typescript`
						export interface ${itemInterfaceName} {}
					`,
				code,
			);
		}

		code = addSection(
			typescript`
				export type ${variationName} = prismic.SharedSliceVariation<"${
				variationModel.id
			}", ${
				primaryInterfaceName
					? typescript`Simplify<${primaryInterfaceName}>`
					: typescript`Record<string, never>`
			}, ${
				itemInterfaceName
					? typescript`Simplify<${itemInterfaceName}>`
					: typescript`never`
			}>;
			`,
			code,
		);

		variationNames.push(variationName);
	}

	const variationUnionName = buildTypeName(name, "Variation");
	const variationsUnion = buildUnion(variationNames);

	code = addSection(
		typescript`
			type ${variationUnionName} = ${
			variationNames.length > 0 ? variationsUnion : "never"
		}
		`,
		code,
	);

	code = addSection(
		typescript`
			export type ${name} = prismic.SharedSlice<"${args.model.id}", ${variationUnionName}>;
		`,
		code,
	);

	return {
		name,
		variationUnionName,
		variationNames,
		code,
	};
}
