import { CustomTypeModel } from "@prismicio/client";

import { AuxiliaryType, Cache, FieldConfigs } from "../types";

import { addSection } from "./addSection";
import { buildCustomTypeDataType } from "./buildCustomTypeDataType";
import { buildTypeName } from "./buildTypeName";
import { buildUnion } from "./buildUnion";
import { checkHasUIDField } from "./checkHasUIDFIeld";
import { createContentDigest } from "./createContentDigest";

type BuildCustomTypeTypesArgs = {
	model: CustomTypeModel;
	localeIDs?: string[];
	fieldConfigs: FieldConfigs;
	cache?: Cache;
};

type BuildCustomTypeTypeReturnValue = {
	name: string;
	dataName: string;
	code: string;
	auxiliaryTypes: AuxiliaryType[];
};

export function buildCustomTypeType(
	args: BuildCustomTypeTypesArgs,
): BuildCustomTypeTypeReturnValue {
	if (args.cache) {
		const key = createContentDigest(
			JSON.stringify([args.model, args.localeIDs, args.fieldConfigs]),
		);
		const cached = args.cache.get(key);

		if (cached) {
			return cached as BuildCustomTypeTypeReturnValue;
		}
	}

	let code = "";

	const auxiliaryTypes: AuxiliaryType[] = [];

	const name = buildTypeName(args.model.id, "Document");
	const langDefault =
		args.localeIDs && args.localeIDs.length > 0
			? buildUnion(args.localeIDs.map((localeID) => `"${localeID}"`))
			: "string";
	const baseDocumentType = checkHasUIDField(args.model)
		? "PrismicDocumentWithUID"
		: "PrismicDocumentWithoutUID";

	const dataType = buildCustomTypeDataType({
		model: args.model,
		fieldConfigs: args.fieldConfigs,
	});

	auxiliaryTypes.push(...dataType.auxiliaryTypes);

	code = addSection(dataType.code, code);

	code = addSection(
		`export type ${name}<Lang extends string = ${langDefault}> = prismic.${baseDocumentType}<Simplify<${dataType.name}>, "${args.model.id}", Lang>;`,
		code,
	);

	const result = {
		name,
		dataName: dataType.name,
		code,
		auxiliaryTypes,
	};

	if (args.cache) {
		const key = createContentDigest(
			JSON.stringify([args.model, args.localeIDs, args.fieldConfigs]),
		);

		args.cache.set(key, result);
	}

	return result;
}
