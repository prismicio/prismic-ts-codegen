import { CustomTypeModel, CustomTypeModelField } from "@prismicio/client";
import { source as typescript } from "common-tags";

import { buildTypeName } from "../lib/buildTypeName";

import { AuxiliaryType, FieldConfigs } from "../types";

import { buildFieldProperties } from "./buildFieldProperties";

function collectCustomTypeFields(
	model: CustomTypeModel,
): Record<string, CustomTypeModelField> {
	return Object.assign({}, ...Object.values(model.json));
}

type BuildCustomTypeDataTypeArgs = {
	model: CustomTypeModel;
	fieldConfigs: FieldConfigs;
};

type BuildCustomTypeDataTypeReturnValue = {
	name: string;
	code: string;
	auxiliaryTypes: AuxiliaryType[];
};

export function buildCustomTypeDataType(
	args: BuildCustomTypeDataTypeArgs,
): BuildCustomTypeDataTypeReturnValue {
	let code = "";

	const fields = collectCustomTypeFields(args.model);
	// UID fields are top-level document properties, not data properties.
	delete fields.uid;

	const name = buildTypeName(args.model.id, "Document", "Data");
	const fieldProperties = buildFieldProperties({
		fields,
		fieldConfigs: args.fieldConfigs,
		path: [
			{
				id: args.model.id,
				model: args.model,
			},
		],
	});

	if (fieldProperties.code) {
		code = typescript`
			interface ${name} {
				${fieldProperties.code}
			}
		`;
	} else {
		code = typescript`
			interface ${name} {}
		`;
	}

	return {
		name,
		code,
		auxiliaryTypes: fieldProperties.auxiliaryTypes,
	};
}
