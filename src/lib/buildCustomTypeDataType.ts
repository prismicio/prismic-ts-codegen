import { CustomTypeModel } from "@prismicio/client";
import { source as typescript } from "common-tags";

import { buildTypeName } from "../lib/buildTypeName";

import { AuxiliaryType, FieldConfigs } from "../types";

import { buildFieldProperties } from "./buildFieldProperties";

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
	const auxiliaryTypes: AuxiliaryType[] = [];

	// const fields = collectCustomTypeFields(args.model);
	// // UID fields are top-level document properties, not data properties.
	// delete fields.uid;

	const name = buildTypeName(args.model.id, "Document", "Data");

	let fieldProperties = "";

	for (const tabName in args.model.json) {
		const { uid: _uid, ...fields } = args.model.json[tabName];

		const tabFieldProperties = buildFieldProperties({
			fields,
			fieldConfigs: args.fieldConfigs,
			path: [
				{
					id: args.model.id,
					model: args.model,
				},
			],
			tabName,
		});

		fieldProperties += tabFieldProperties.code;

		auxiliaryTypes.push(...tabFieldProperties.auxiliaryTypes);
	}

	if (fieldProperties) {
		code = typescript`
			interface ${name} {
				${fieldProperties}
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
		auxiliaryTypes,
	};
}
