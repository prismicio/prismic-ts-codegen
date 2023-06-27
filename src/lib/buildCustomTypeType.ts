import { CustomTypeModel } from "@prismicio/client";
import { source as typescript } from "common-tags";

import { AuxiliaryType, FieldConfigs } from "../types";

import { addSection } from "./addSection";
import { buildCustomTypeDataType } from "./buildCustomTypeDataType";
import { buildTypeName } from "./buildTypeName";
import { buildUnion } from "./buildUnion";
import { checkHasUIDField } from "./checkHasUIDFIeld";

type BuildCustomTypeTypesArgs = {
	model: CustomTypeModel;
	localeIDs?: string[];
	fieldConfigs: FieldConfigs;
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
		typescript`
			export type ${name}<Lang extends string = ${langDefault}> =
				prismic.${baseDocumentType}<Simplify<${dataType.name}>, "${args.model.id}", Lang>;
		`,
		code,
	);

	return {
		name,
		dataName: dataType.name,
		code,
		auxiliaryTypes,
	};
}
