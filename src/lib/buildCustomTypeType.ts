import type { CustomTypeModel } from "@prismicio/client";
import { source } from "common-tags";
import QuickLRU from "quick-lru";

import { AuxiliaryType, FieldConfigs } from "../types";

import { CUSTOM_TYPES_DOCUMENTATION_URL } from "../constants";

import { addSection } from "./addSection";
import { buildCustomTypeDataType } from "./buildCustomTypeDataType";
import { buildTypeName } from "./buildTypeName";
import { buildUnion } from "./buildUnion";
import { checkHasUIDField } from "./checkHasUIDFIeld";
import { getCacheKey } from "./getCacheKey";
import { getHumanReadableModelName } from "./getHumanReadableModelName";

type BuildCustomTypeTypesArgs = {
	model: CustomTypeModel;
	localeIDs?: string[];
	fieldConfigs: FieldConfigs;
	cache?: QuickLRU<string, unknown>;
};

type BuildCustomTypeTypeReturnValue = {
	name: string;
	code: string;
	auxiliaryTypes: AuxiliaryType[];
	contentTypeNames: string[];
};

export function buildCustomTypeType(
	args: BuildCustomTypeTypesArgs,
): BuildCustomTypeTypeReturnValue {
	if (args.cache) {
		const key = getCacheKey(args.model);
		const cached = args.cache.get(key);

		if (cached) {
			return cached as BuildCustomTypeTypeReturnValue;
		}
	}

	let code = "";

	const auxiliaryTypes: AuxiliaryType[] = [];
	const contentTypeNames: string[] = [];

	const name = buildTypeName(args.model.id, "Document");
	const langDefault =
		args.localeIDs && args.localeIDs.length > 0
			? buildUnion(args.localeIDs.map((localeID) => `"${localeID}"`))
			: "string";
	const baseDocumentType = checkHasUIDField(args.model)
		? "PrismicDocumentWithUID"
		: "PrismicDocumentWithoutUID";
	const humanReadableName = getHumanReadableModelName({
		name: args.model.id,
		model: args.model,
	});

	const dataType = buildCustomTypeDataType({
		model: args.model,
		fieldConfigs: args.fieldConfigs,
	});

	auxiliaryTypes.push(...dataType.auxiliaryTypes);
	contentTypeNames.push(dataType.name);
	contentTypeNames.push(...dataType.contentTypeNames);

	code = addSection(dataType.code, code);

	code = addSection(
		source`
			/**
			 * ${humanReadableName} document from Prismic
			 *
			 * - **API ID**: \`${args.model.id}\`
			 * - **Repeatable**: \`${args.model.repeatable.toString()}\`
			 * - **Documentation**: ${CUSTOM_TYPES_DOCUMENTATION_URL}
			 *
			 * @typeParam Lang - Language API ID of the document.
			 */
			export type ${name}<Lang extends string = ${langDefault}> = prismic.${baseDocumentType}<Simplify<${
			dataType.name
		}>, "${args.model.id}", Lang>;
		`,
		code,
	);

	const result = {
		name,
		code,
		auxiliaryTypes,
		contentTypeNames,
	};

	if (args.cache) {
		const key = getCacheKey(args.model);

		args.cache.set(key, result);
	}

	return result;
}
